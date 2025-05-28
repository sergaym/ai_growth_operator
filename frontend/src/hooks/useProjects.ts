"use client";

import React, { useEffect } from 'react';

// Re-export everything from the context for backward compatibility
export {
  type ProjectAssetSummary,
  type Project,
  type ProjectCreateRequest,
  type ProjectUpdateRequest,
  type ProjectAsset,
  type ProjectAssetsResponse,
  type ProjectStats,
  useProjectsContext as useProjects,
} from '@/contexts/ProjectsContext';

// For components that specifically need only the projects list for a workspace
import { useProjectsContext, type Project } from '@/contexts/ProjectsContext';

export interface ProjectListResponse {
  projects: Project[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface ProjectAsset {
  id: string;
  type: 'video' | 'audio' | 'lipsync_video';
  status: string;
  created_at: string;
  updated_at: string;
  file_url?: string;
  thumbnail_url?: string;
  metadata?: Record<string, any>;
}

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

export function useProjects(workspaceId?: string) {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<ProjectStats | null>(null);

  // List projects in a workspace
  const listProjects = useCallback(async (
    options: {
      page?: number;
      per_page?: number;
      status?: string;
      search?: string;
      include_assets?: boolean;
    } = {}
  ): Promise<ProjectListResponse | null> => {
    if (!workspaceId || !user.isAuthenticated) {
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (options.page) params.append('page', options.page.toString());
      if (options.per_page) params.append('per_page', options.per_page.toString());
      if (options.status) params.append('status', options.status);
      if (options.search) params.append('search', options.search);
      if (options.include_assets) params.append('include_assets', 'true');

      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/workspaces/${workspaceId}/projects?${params}`;
      const data = await apiClient<ProjectListResponse>(url);
      
      setProjects(data.projects);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch projects';
      setError(errorMessage);
      console.error('Error fetching projects:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [workspaceId, user.isAuthenticated]);

  // Create a new project
  const createProject = useCallback(async (
    request: ProjectCreateRequest
  ): Promise<Project | null> => {
    if (!workspaceId || !user.isAuthenticated || !user.user?.id) {
      setError('User not authenticated or workspace not specified');
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/workspaces/${workspaceId}/projects`;
      const project = await apiClient<Project>(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      // Add the new project to the current list
      setProjects(prev => [project, ...prev]);
      return project;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create project';
      setError(errorMessage);
      console.error('Error creating project:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [workspaceId, user.isAuthenticated, user.user?.id]);

  // Get a specific project
  const getProject = useCallback(async (
    projectId: string,
    includeAssets: boolean = false
  ): Promise<Project | null> => {
    if (!workspaceId || !user.isAuthenticated) {
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      const params = includeAssets ? '?include_assets=true' : '';
      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/workspaces/${workspaceId}/projects/${projectId}${params}`;
      const project = await apiClient<Project>(url);
      
      return project;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch project';
      setError(errorMessage);
      console.error('Error fetching project:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [workspaceId, user.isAuthenticated]);

  // Update a project
  const updateProject = useCallback(async (
    projectId: string,
    request: ProjectUpdateRequest
  ): Promise<Project | null> => {
    if (!workspaceId || !user.isAuthenticated) {
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/workspaces/${workspaceId}/projects/${projectId}`;
      const updatedProject = await apiClient<Project>(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      // Update the project in the current list
      setProjects(prev => prev.map(p => p.id === projectId ? updatedProject : p));
      return updatedProject;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update project';
      setError(errorMessage);
      console.error('Error updating project:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [workspaceId, user.isAuthenticated]);

  // Delete a project
  const deleteProject = useCallback(async (projectId: string): Promise<boolean> => {
    if (!workspaceId || !user.isAuthenticated) {
      return false;
    }

    try {
      setLoading(true);
      setError(null);

      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/workspaces/${workspaceId}/projects/${projectId}`;
      await apiClient(url, { method: 'DELETE' });

      // Remove the project from the current list
      setProjects(prev => prev.filter(p => p.id !== projectId));
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete project';
      setError(errorMessage);
      console.error('Error deleting project:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [workspaceId, user.isAuthenticated]);

  // Get project assets
  const getProjectAssets = useCallback(async (
    projectId: string,
    assetType?: string
  ): Promise<ProjectAssetsResponse | null> => {
    if (!workspaceId || !user.isAuthenticated) {
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      const params = assetType ? `?asset_type=${assetType}` : '';
      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/workspaces/${workspaceId}/projects/${projectId}/assets${params}`;
      const assets = await apiClient<ProjectAssetsResponse>(url);
      
      return assets;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch project assets';
      setError(errorMessage);
      console.error('Error fetching project assets:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [workspaceId, user.isAuthenticated]);

  // Get workspace project statistics
  const getWorkspaceStats = useCallback(async (): Promise<ProjectStats | null> => {
    if (!workspaceId || !user.isAuthenticated) {
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/workspaces/${workspaceId}/projects/stats`;
      const statsData = await apiClient<ProjectStats>(url);
      
      setStats(statsData);
      return statsData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch workspace stats';
      setError(errorMessage);
      console.error('Error fetching workspace stats:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [workspaceId, user.isAuthenticated]);

  // Auto-fetch projects when workspaceId changes
  useEffect(() => {
    if (workspaceId && user.isAuthenticated) {
      listProjects({ include_assets: true });
    }
  }, [workspaceId, user.isAuthenticated, listProjects]);

  return {
    // State
    projects,
    loading,
    error,
    stats,
    
    // Actions
    listProjects,
    createProject,
    getProject,
    updateProject,
    deleteProject,
    getProjectAssets,
    getWorkspaceStats,
    
    // Utilities
    refreshProjects: () => listProjects({ include_assets: true }),
    clearError: () => setError(null),
  };
} 