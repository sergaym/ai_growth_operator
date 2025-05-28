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

// For components that need to work with projects in a specific workspace
export function useWorkspaceProjects(workspaceId?: string) {
  const { 
    projectsByWorkspace, 
    loading, 
    error, 
    fetchProjects,
    refreshProjects,
    createProject,
    deleteProject,
    statsByWorkspace,
    fetchedWorkspaces,
    clearError 
  } = useProjectsContext();

  // Auto-fetch projects for this workspace when workspaceId changes
  useEffect(() => {
    if (workspaceId && !loading) {
      fetchProjects(workspaceId);
    }
  }, [workspaceId, fetchProjects, loading]);

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