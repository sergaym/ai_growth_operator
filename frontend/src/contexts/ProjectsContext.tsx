"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '../services/apiClient';

// Project status enum to match backend
export enum ProjectStatus {
  DRAFT = "draft",
  IN_PROGRESS = "in_progress", 
  COMPLETED = "completed",
  ARCHIVED = "archived"
}

// Project interfaces
export interface ProjectAssetSummary {
  total_videos: number;
  total_audio: number;
  total_images: number;
  total_lipsync_videos: number;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  workspace_id: string;
  created_by_user_id: string;
  created_at: string;
  updated_at: string;
  last_activity_at: string;
  thumbnail_url?: string;
  asset_summary?: ProjectAssetSummary;
  metadata?: Record<string, any>;
}

export interface ProjectCreateRequest {
  name: string;
  description?: string;
  thumbnail_url?: string;
  metadata?: Record<string, any>;
}

export interface ProjectUpdateRequest {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  thumbnail_url?: string;
  metadata?: Record<string, any>;
}

export interface ProjectAsset {
  id: string;
  project_id: string;
  type: string;
  status: string;
  filename: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  created_at: string;
  updated_at: string;
  file_url?: string;
  thumbnail_url?: string;
  metadata?: Record<string, any>;
}

export interface ProjectAssetsResponse {
  assets: ProjectAsset[];
  total: number;
}

export interface ProjectStats {
  total_projects: number;
  active_projects: number;
  completed_projects: number;
  total_assets: number;
}

interface ProjectsContextType {
  // State
  projectsByWorkspace: { [workspaceId: string]: Project[] };
  statsByWorkspace: { [workspaceId: string]: ProjectStats };
  fetchedWorkspaces: Set<string>;
  loading: boolean;
  error: string | null;
  
  // Loading states for specific operations
  loadingStates: {
    fetching: { [workspaceId: string]: boolean };
    creating: { [workspaceId: string]: boolean };
    updating: { [projectId: string]: boolean };
    deleting: { [projectId: string]: boolean };
  };
  
  // Actions
  fetchProjects: (workspaceId: string) => Promise<Project[]>;
  refreshProjects: (workspaceId: string) => Promise<Project[]>;
  createProject: (workspaceId: string, request: ProjectCreateRequest) => Promise<Project | null>;
  getProject: (workspaceId: string, projectId: string, includeAssets?: boolean) => Promise<Project | null>;
  updateProject: (workspaceId: string, projectId: string, request: ProjectUpdateRequest) => Promise<Project | null>;
  deleteProject: (workspaceId: string, projectId: string) => Promise<boolean>;
  getProjectAssets: (workspaceId: string, projectId: string, assetType?: string) => Promise<ProjectAssetsResponse | null>;
  getWorkspaceStats: (workspaceId: string) => Promise<ProjectStats | null>;
  clearError: () => void;
  
  // Utility functions
  isProjectLoading: (projectId: string) => boolean;
  isWorkspaceLoading: (workspaceId: string) => boolean;
}

const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined);

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  
  const [projectsByWorkspace, setProjectsByWorkspace] = useState<{ [workspaceId: string]: Project[] }>({});
  const [statsByWorkspace, setStatsByWorkspace] = useState<{ [workspaceId: string]: ProjectStats }>({});
  const [fetchedWorkspaces, setFetchedWorkspaces] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Enhanced loading states for granular control
  const [loadingStates, setLoadingStates] = useState({
    fetching: {} as { [workspaceId: string]: boolean },
    creating: {} as { [workspaceId: string]: boolean },
    updating: {} as { [projectId: string]: boolean },
    deleting: {} as { [projectId: string]: boolean },
  });

  // Utility functions for loading states
  const isProjectLoading = useCallback((projectId: string): boolean => {
    return loadingStates.updating[projectId] || loadingStates.deleting[projectId] || false;
  }, [loadingStates]);

  const isWorkspaceLoading = useCallback((workspaceId: string): boolean => {
    return loadingStates.fetching[workspaceId] || loadingStates.creating[workspaceId] || false;
  }, [loadingStates]);

  // Helper to update specific loading states
  const updateLoadingState = useCallback((
    category: keyof typeof loadingStates,
    key: string,
    isLoading: boolean
  ) => {
    setLoadingStates(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: isLoading
      }
    }));
  }, []);

  // Fetch projects for a workspace
  const fetchProjects = useCallback(async (workspaceId: string): Promise<Project[]> => {
    if (!user.isAuthenticated || !workspaceId) {
      return [];
    }

    // Don't fetch if already loading or already fetched
    if (loading || fetchedWorkspaces.has(workspaceId)) {
      return projectsByWorkspace[workspaceId] || [];
    }

    setLoading(true);
    setError(null);
    
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/workspaces/${workspaceId}/projects`;
      const data = await apiClient<{ projects: Project[] }>(url);
      
      const projects = data.projects || [];
      setProjectsByWorkspace(prev => ({
        ...prev,
        [workspaceId]: projects
      }));
      
      // Mark this workspace as fetched
      setFetchedWorkspaces(prev => new Set(prev).add(workspaceId));
      
      return projects;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch projects';
      setError(errorMessage);
      console.error('Error fetching projects:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user.isAuthenticated, loading, fetchedWorkspaces, projectsByWorkspace]);

  // Refresh projects for a workspace (force refetch)
  const refreshProjects = useCallback(async (workspaceId: string): Promise<Project[]> => {
    if (!user.isAuthenticated || !workspaceId) {
      return [];
    }

    // Remove from fetched cache to force refetch
    setFetchedWorkspaces(prev => {
      const newSet = new Set(prev);
      newSet.delete(workspaceId);
      return newSet;
    });

    // Now fetch projects
    return fetchProjects(workspaceId);
  }, [user.isAuthenticated, fetchProjects]);

  // Create a new project
  const createProject = useCallback(async (workspaceId: string, request: ProjectCreateRequest): Promise<Project | null> => {
    if (!user.isAuthenticated || !workspaceId) {
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/workspaces/${workspaceId}/projects`;
      const project = await apiClient<Project>(url, {
        method: 'POST',
        body: JSON.stringify(request),
      });

      // Update local state
      setProjectsByWorkspace(prev => ({
        ...prev,
        [workspaceId]: [...(prev[workspaceId] || []), project]
      }));

      return project;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create project';
      setError(errorMessage);
      console.error('Error creating project:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user.isAuthenticated]);

  // Get a specific project
  const getProject = useCallback(async (workspaceId: string, projectId: string, includeAssets?: boolean): Promise<Project | null> => {
    if (!user.isAuthenticated || !workspaceId || !projectId) {
      return null;
    }

    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/workspaces/${workspaceId}/projects/${projectId}${includeAssets ? '?include_assets=true' : ''}`;
      const project = await apiClient<Project>(url);
      
      return project;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch project';
      setError(errorMessage);
      console.error('Error fetching project:', err);
      return null;
    }
  }, [user.isAuthenticated]);

  // Update a project
  const updateProject = useCallback(async (workspaceId: string, projectId: string, request: ProjectUpdateRequest): Promise<Project | null> => {
    if (!user.isAuthenticated || !workspaceId || !projectId) {
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/workspaces/${workspaceId}/projects/${projectId}`;
      const updatedProject = await apiClient<Project>(url, {
        method: 'PUT',
        body: JSON.stringify(request),
      });

      // Update local state
      setProjectsByWorkspace(prev => ({
        ...prev,
        [workspaceId]: prev[workspaceId]?.map(p => p.id === projectId ? updatedProject : p) || []
      }));

      return updatedProject;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update project';
      setError(errorMessage);
      console.error('Error updating project:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user.isAuthenticated]);

  // Delete a project
  const deleteProject = useCallback(async (workspaceId: string, projectId: string): Promise<boolean> => {
    if (!user.isAuthenticated || !workspaceId || !projectId) {
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/workspaces/${workspaceId}/projects/${projectId}`;
      await apiClient(url, { method: 'DELETE' });

      // Update local state
      setProjectsByWorkspace(prev => ({
        ...prev,
        [workspaceId]: prev[workspaceId]?.filter(p => p.id !== projectId) || []
      }));

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete project';
      setError(errorMessage);
      console.error('Error deleting project:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user.isAuthenticated]);

  // Get project assets
  const getProjectAssets = useCallback(async (workspaceId: string, projectId: string, assetType?: string): Promise<ProjectAssetsResponse | null> => {
    if (!user.isAuthenticated || !workspaceId || !projectId) {
      return null;
    }

    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/workspaces/${workspaceId}/projects/${projectId}/assets${assetType ? `?type=${assetType}` : ''}`;
      const response = await apiClient<ProjectAssetsResponse>(url);
      
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch project assets';
      setError(errorMessage);
      console.error('Error fetching project assets:', err);
      return null;
    }
  }, [user.isAuthenticated]);

  // Get workspace stats
  const getWorkspaceStats = useCallback(async (workspaceId: string): Promise<ProjectStats | null> => {
    if (!user.isAuthenticated || !workspaceId) {
      return null;
    }

    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/workspaces/${workspaceId}/stats`;
      const stats = await apiClient<ProjectStats>(url);
      
      setStatsByWorkspace(prev => ({
        ...prev,
        [workspaceId]: stats
      }));
      
      return stats;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch workspace stats';
      setError(errorMessage);
      console.error('Error fetching workspace stats:', err);
      return null;
    }
  }, [user.isAuthenticated]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: ProjectsContextType = {
    projectsByWorkspace,
    statsByWorkspace,
    fetchedWorkspaces,
    loading,
    error,
    loadingStates,
    fetchProjects,
    refreshProjects,
    createProject,
    getProject,
    updateProject,
    deleteProject,
    getProjectAssets,
    getWorkspaceStats,
    clearError,
    isProjectLoading,
    isWorkspaceLoading,
  };

  return (
    <ProjectsContext.Provider value={value}>
      {children}
    </ProjectsContext.Provider>
  );
}

export function useProjectsContext() {
  const context = useContext(ProjectsContext);
  if (context === undefined) {
    throw new Error('useProjectsContext must be used within a ProjectsProvider');
  }
  return context;
} 