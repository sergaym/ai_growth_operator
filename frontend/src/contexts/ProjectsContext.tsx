"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '../services/apiClient';

// Project status enum to match backend
export enum ProjectStatus {
  DRAFT = "draft",
  IN_PROGRESS = "in_progress", 
  COMPLETED = "completed",
  ARCHIVED = "archived"
}

// Enhanced interfaces to match backend schemas exactly
export interface ProjectAssetSummary {
  total_videos: number;
  total_audio: number;
  total_images: number;
  total_lipsync_videos: number;
  latest_asset_created_at?: string; // ISO string from backend
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

// Enhanced asset interface to match backend ProjectAssetResponse exactly
export interface ProjectAsset {
  id: string;
  type: string; // 'video' | 'audio' | 'lipsync_video'
  status: string;
  created_at: string;
  updated_at: string;
  file_url?: string;
  thumbnail_url?: string;
  metadata?: Record<string, any>;
}

// Enhanced assets response to match backend ProjectAssetsResponse exactly
export interface ProjectAssetsResponse {
  assets: ProjectAsset[];
  total: number;
  asset_summary: ProjectAssetSummary;
}

export interface ProjectStats {
  total_projects: number;
  projects_by_status: Record<string, number>;
  total_assets: number;
  recent_activity_count: number;
  most_active_projects: Project[];
}

// Enhanced error types for better error handling
export interface ProjectError {
  code: string;
  message: string;
  details?: any;
}

// Cache entry for assets with TTL
interface AssetsCacheEntry {
  data: ProjectAssetsResponse;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

interface ProjectsContextType {
  // State
  projectsByWorkspace: { [workspaceId: string]: Project[] };
  statsByWorkspace: { [workspaceId: string]: ProjectStats };
  assetsByProject: { [projectId: string]: ProjectAssetsResponse };
  fetchedWorkspaces: Set<string>;
  loading: boolean;
  error: ProjectError | null;
  
  // Enhanced loading states for granular control
  loadingStates: {
    fetching: { [workspaceId: string]: boolean };
    creating: { [workspaceId: string]: boolean };
    updating: { [projectId: string]: boolean };
    deleting: { [projectId: string]: boolean };
    fetchingAssets: { [projectId: string]: boolean };
    refreshingAssets: { [projectId: string]: boolean };
  };
  
  // Actions
  fetchProjects: (workspaceId: string) => Promise<Project[]>;
  refreshProjects: (workspaceId: string) => Promise<Project[]>;
  createProject: (workspaceId: string, request: ProjectCreateRequest) => Promise<Project | null>;
  getProject: (workspaceId: string, projectId: string, includeAssets?: boolean) => Promise<Project | null>;
  updateProject: (workspaceId: string, projectId: string, request: ProjectUpdateRequest) => Promise<Project | null>;
  deleteProject: (workspaceId: string, projectId: string) => Promise<boolean>;
  getProjectAssets: (workspaceId: string, projectId: string, assetType?: string, forceRefresh?: boolean) => Promise<ProjectAssetsResponse | null>;
  refreshProjectAssets: (workspaceId: string, projectId: string, assetType?: string) => Promise<ProjectAssetsResponse | null>;
  getWorkspaceStats: (workspaceId: string) => Promise<ProjectStats | null>;
  clearError: () => void;
  
  // Utility functions
  isProjectLoading: (projectId: string) => boolean;
  isWorkspaceLoading: (workspaceId: string) => boolean;
  isProjectAssetsLoading: (projectId: string) => boolean;
  getCachedAssets: (projectId: string) => ProjectAssetsResponse | null;
  invalidateAssetsCache: (projectId?: string) => void;
}

const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined);

// Cache TTL constants
const ASSETS_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE = 50; // Maximum number of cached asset entries

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  
  const [projectsByWorkspace, setProjectsByWorkspace] = useState<{ [workspaceId: string]: Project[] }>({});
  const [statsByWorkspace, setStatsByWorkspace] = useState<{ [workspaceId: string]: ProjectStats }>({});
  const [assetsByProject, setAssetsByProject] = useState<{ [projectId: string]: ProjectAssetsResponse }>({});
  const [fetchedWorkspaces, setFetchedWorkspaces] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ProjectError | null>(null);

  // Assets cache with TTL support
  const assetsCacheRef = useRef<Map<string, AssetsCacheEntry>>(new Map());

  // Enhanced loading states for granular control
  const [loadingStates, setLoadingStates] = useState({
    fetching: {} as { [workspaceId: string]: boolean },
    creating: {} as { [workspaceId: string]: boolean },
    updating: {} as { [projectId: string]: boolean },
    deleting: {} as { [projectId: string]: boolean },
    fetchingAssets: {} as { [projectId: string]: boolean },
    refreshingAssets: {} as { [projectId: string]: boolean },
  });

  // Enhanced error handling
  const createError = useCallback((code: string, message: string, details?: any): ProjectError => {
    return { code, message, details };
  }, []);

  const handleApiError = useCallback((err: any, context: string): ProjectError => {
    console.error(`${context}:`, err);
    
    if (err.response?.status === 404) {
      return createError('NOT_FOUND', `Resource not found: ${context}`, err);
    } else if (err.response?.status === 403) {
      return createError('FORBIDDEN', `Access denied: ${context}`, err);
    } else if (err.response?.status >= 500) {
      return createError('SERVER_ERROR', `Server error: ${context}`, err);
    } else if (err.name === 'AbortError') {
      return createError('CANCELLED', `Request cancelled: ${context}`, err);
    } else {
      const message = err instanceof Error ? err.message : `Failed: ${context}`;
      return createError('UNKNOWN', message, err);
    }
  }, [createError]);

  // Utility functions for loading states
  const isProjectLoading = useCallback((projectId: string): boolean => {
    return loadingStates.updating[projectId] || loadingStates.deleting[projectId] || false;
  }, [loadingStates]);

  const isWorkspaceLoading = useCallback((workspaceId: string): boolean => {
    return loadingStates.fetching[workspaceId] || loadingStates.creating[workspaceId] || false;
  }, [loadingStates]);

  const isProjectAssetsLoading = useCallback((projectId: string): boolean => {
    return loadingStates.fetchingAssets[projectId] || loadingStates.refreshingAssets[projectId] || false;
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

  // Cache management functions
  const getCachedAssets = useCallback((projectId: string): ProjectAssetsResponse | null => {
    const cache = assetsCacheRef.current;
    const entry = cache.get(projectId);
    
    if (!entry) return null;
    
    const now = Date.now();
    if (now > entry.timestamp + entry.ttl) {
      // Cache expired
      cache.delete(projectId);
      return null;
    }
    
    return entry.data;
  }, []);

  const setCachedAssets = useCallback((projectId: string, data: ProjectAssetsResponse) => {
    const cache = assetsCacheRef.current;
    
    // Cleanup old entries if cache is too large
    if (cache.size >= MAX_CACHE_SIZE) {
      const oldestKey = cache.keys().next().value;
      if (oldestKey) cache.delete(oldestKey);
    }
    
    cache.set(projectId, {
      data,
      timestamp: Date.now(),
      ttl: ASSETS_CACHE_TTL
    });
    
    // Also update the state cache
    setAssetsByProject(prev => ({
      ...prev,
      [projectId]: data
    }));
  }, []);

  const invalidateAssetsCache = useCallback((projectId?: string) => {
    const cache = assetsCacheRef.current;
    
    if (projectId) {
      cache.delete(projectId);
      setAssetsByProject(prev => {
        const { [projectId]: removed, ...rest } = prev;
        return rest;
      });
    } else {
      cache.clear();
      setAssetsByProject({});
    }
  }, []);

  // Fetch projects for a workspace
  const fetchProjects = useCallback(async (workspaceId: string): Promise<Project[]> => {
    if (!user.isAuthenticated || !workspaceId) {
      return [];
    }

    // Don't fetch if already loading or already fetched
    if (loadingStates.fetching[workspaceId] || fetchedWorkspaces.has(workspaceId)) {
      return projectsByWorkspace[workspaceId] || [];
    }

    updateLoadingState('fetching', workspaceId, true);
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
      const error = handleApiError(err, `fetching projects for workspace ${workspaceId}`);
      setError(error);
      return [];
    } finally {
      setLoading(false);
      updateLoadingState('fetching', workspaceId, false);
    }
  }, [user.isAuthenticated, loadingStates.fetching, fetchedWorkspaces, projectsByWorkspace, updateLoadingState, handleApiError]);

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

    updateLoadingState('creating', workspaceId, true);
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
      const error = handleApiError(err, `creating project in workspace ${workspaceId}`);
      setError(error);
      console.error('Error creating project:', error);
      return null;
    } finally {
      updateLoadingState('creating', workspaceId, false);
    }
  }, [user.isAuthenticated, updateLoadingState, handleApiError]);

  // Get a specific project
  const getProject = useCallback(async (workspaceId: string, projectId: string, includeAssets?: boolean): Promise<Project | null> => {
    // Wait for authentication to be fully initialized before checking
    if (loading || (!user.isAuthenticated && !user.user)) {
      console.log('getProject: Waiting for auth initialization...', { loading, isAuthenticated: user.isAuthenticated, hasUser: !!user.user });
      return null;
    }
    
    if (!user.isAuthenticated || !workspaceId || !projectId) {
      console.log('getProject: Authentication or params missing', { isAuthenticated: user.isAuthenticated, workspaceId, projectId });
      return null;
    }

    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/workspaces/${workspaceId}/projects/${projectId}${includeAssets ? '?include_assets=true' : ''}`;
      
      const project = await apiClient<Project>(url);
      
      // Cache the project in the workspace projects list if not already there
      if (project) {
        setProjectsByWorkspace(prev => {
          const workspaceProjects = prev[workspaceId] || [];
          const existingIndex = workspaceProjects.findIndex(p => p.id === projectId);
          
          if (existingIndex >= 0) {
            // Update existing project
            const updatedProjects = [...workspaceProjects];
            updatedProjects[existingIndex] = project;
            return { ...prev, [workspaceId]: updatedProjects };
          } else {
            // Add new project to the list
            return { ...prev, [workspaceId]: [...workspaceProjects, project] };
          }
        });
      }
      
      return project;
    } catch (err) {
      const error = handleApiError(err, `fetching project ${projectId}`);
      console.error('Error fetching project:', error);
      // Don't set global error for individual project fetches
      return null;
    }
  }, [user.isAuthenticated, user.user, loading, handleApiError]);

  // Update a project
  const updateProject = useCallback(async (workspaceId: string, projectId: string, request: ProjectUpdateRequest): Promise<Project | null> => {
    if (!user.isAuthenticated || !workspaceId || !projectId) {
      return null;
    }

    updateLoadingState('updating', projectId, true);
    setError(null);

    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/workspaces/${workspaceId}/projects/${projectId}`;
      const updatedProject = await apiClient<Project>(url, {
        method: 'PATCH',
        body: JSON.stringify(request),
      });

      // Update local state
      setProjectsByWorkspace(prev => ({
        ...prev,
        [workspaceId]: prev[workspaceId]?.map(p => p.id === projectId ? updatedProject : p) || []
      }));

      console.log(`Updated project ${projectId} in workspace ${workspaceId}`);
      return updatedProject;
    } catch (err) {
      const error = handleApiError(err, `updating project ${projectId}`);
      setError(error);
      console.error('Error updating project:', error);
      return null;
    } finally {
      updateLoadingState('updating', projectId, false);
    }
  }, [user.isAuthenticated, updateLoadingState, handleApiError]);

  // Delete a project
  const deleteProject = useCallback(async (workspaceId: string, projectId: string): Promise<boolean> => {
    if (!user.isAuthenticated || !workspaceId || !projectId) {
      return false;
    }

    // Check if project exists before attempting deletion
    const existingProject = projectsByWorkspace[workspaceId]?.find(p => p.id === projectId);
    if (!existingProject) {
      console.warn('Delete project: Project not found in local state', { workspaceId, projectId });
      // Still attempt API call in case it exists on server
    }

    updateLoadingState('deleting', projectId, true);
    setError(null);

    try {
      console.log('Delete project: Starting deletion', { workspaceId, projectId });
      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/workspaces/${workspaceId}/projects/${projectId}`;
      await apiClient(url, { method: 'DELETE' });

      console.log('Delete project: API call successful, updating local state');
      
      // Update local state - remove the project from the workspace
      setProjectsByWorkspace(prev => {
        const currentProjects = prev[workspaceId] || [];
        const updatedProjects = currentProjects.filter(p => p.id !== projectId);
        
        console.log('Delete project: Updated projects count', {
          before: currentProjects.length,
          after: updatedProjects.length,
          removed: currentProjects.length - updatedProjects.length
        });
        
        return {
          ...prev,
          [workspaceId]: updatedProjects
        };
      });

      // Also invalidate any cached assets for this project
      invalidateAssetsCache(projectId);

      return true;
    } catch (err) {
      const error = handleApiError(err, `deleting project ${projectId}`);
      setError(error);
      console.error('Delete project: API call failed', { 
        workspaceId, 
        projectId, 
        error 
      });
      return false;
    } finally {
      updateLoadingState('deleting', projectId, false);
    }
  }, [user.isAuthenticated, projectsByWorkspace, updateLoadingState, handleApiError, invalidateAssetsCache]);

  // Enhanced get project assets with caching and better error handling
  const getProjectAssets = useCallback(async (
    workspaceId: string, 
    projectId: string, 
    assetType?: string,
    forceRefresh?: boolean
  ): Promise<ProjectAssetsResponse | null> => {
    console.log(`🎯 getProjectAssets called:`, { workspaceId, projectId, assetType, forceRefresh });
    
    // Wait for authentication to be fully initialized before checking
    if (loading || (!user.isAuthenticated && !user.user)) {
      console.log('🔒 getProjectAssets: Waiting for auth initialization...', { loading, isAuthenticated: user.isAuthenticated, hasUser: !!user.user });
      return null;
    }
    
    if (!user.isAuthenticated || !workspaceId || !projectId) {
      console.log('❌ getProjectAssets: Authentication or params missing', { isAuthenticated: user.isAuthenticated, workspaceId, projectId });
      return null;
    }

    // Check cache first unless forcing refresh
    if (!forceRefresh) {
      const cached = getCachedAssets(projectId);
      if (cached) {
        console.log(`📦 Using cached assets for project ${projectId}`, cached);
        return cached;
      }
    }

    const loadingKey = forceRefresh ? 'refreshingAssets' : 'fetchingAssets';
    if (loadingStates[loadingKey][projectId]) {
      console.log(`⏳ Already loading assets for project ${projectId}, returning cached data`);
      // Already loading, return cached data if available
      return assetsByProject[projectId] || null;
    }

    updateLoadingState(loadingKey, projectId, true);

    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/workspaces/${workspaceId}/projects/${projectId}/assets${assetType ? `?type=${assetType}` : ''}`;
      console.log(`🌐 Fetching assets from URL: ${url}`);
      
      const response = await apiClient<ProjectAssetsResponse>(url);
      console.log('📥 Raw assets response:', JSON.stringify(response, null, 2));
      
      // Backend now handles URL optimization, so we can use the response directly
      // The file_url field now contains the prioritized blob storage URL
      console.log(`🎉 Successfully fetched ${response.total} assets for project ${projectId}`, {
        total: response.total,
        assetsWithUrls: response.assets.filter(a => a.file_url).length,
        assetSummary: response.asset_summary,
        assetTypes: response.assets.map(a => `${a.type}:${a.status}:${a.file_url ? 'has_url' : 'no_url'}`),
        assets: response.assets.map(a => ({
          id: a.id,
          type: a.type,
          status: a.status,
          file_url: a.file_url,
          has_metadata: Boolean(a.metadata)
        }))
      });
      
      // Cache the response directly - backend handles URL optimization
      setCachedAssets(projectId, response);
      
      return response;
    } catch (err) {
      const error = handleApiError(err, `fetching assets for project ${projectId}`);
      console.error('💥 Project assets fetch failed:', error);
      
      // For refresh operations, don't set global error but still log
      if (!forceRefresh) {
        setError(error);
      }
      
      return null;
    } finally {
      updateLoadingState(loadingKey, projectId, false);
    }
  }, [user.isAuthenticated, user.user, loading, loadingStates, assetsByProject, getCachedAssets, setCachedAssets, updateLoadingState, handleApiError]);

  // Refresh project assets (force refresh)
  const refreshProjectAssets = useCallback(async (
    workspaceId: string, 
    projectId: string, 
    assetType?: string
  ): Promise<ProjectAssetsResponse | null> => {
    // Invalidate cache for this project
    invalidateAssetsCache(projectId);
    
    // Fetch with force refresh flag
    return getProjectAssets(workspaceId, projectId, assetType, true);
  }, [getProjectAssets, invalidateAssetsCache]);

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
      
      console.log(`Fetched workspace stats for ${workspaceId}:`, stats);
      return stats;
    } catch (err) {
      const error = handleApiError(err, `fetching workspace stats for workspace ${workspaceId}`);
      setError(error);
      console.error('Error fetching workspace stats:', error);
      return null;
    }
  }, [user.isAuthenticated, handleApiError]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: ProjectsContextType = {
    projectsByWorkspace,
    statsByWorkspace,
    assetsByProject,
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
    refreshProjectAssets,
    getWorkspaceStats,
    clearError,
    isProjectLoading,
    isWorkspaceLoading,
    isProjectAssetsLoading,
    getCachedAssets,
    invalidateAssetsCache,
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