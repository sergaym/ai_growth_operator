"use client";

import React, { useEffect, useCallback, useMemo, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

// Re-export everything from the context for backward compatibility
export {
  type ProjectAssetSummary,
  type Project,
  type ProjectCreateRequest,
  type ProjectUpdateRequest,
  type ProjectAsset,
  type ProjectAssetsResponse,
  type ProjectStats,
  type ProjectError,
  ProjectStatus,
  useProjectsContext as useProjects,
} from '@/contexts/ProjectsContext';

// For components that specifically need only the projects list for a workspace
import { 
  useProjectsContext, 
  type Project, 
  type ProjectCreateRequest,
  type ProjectUpdateRequest,
  type ProjectError,
  type ProjectAssetsResponse 
} from '@/contexts/ProjectsContext';

export interface ProjectListResponse {
  projects: Project[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// Enhanced return types for better type inference and error handling
export interface UseWorkspaceProjectsReturn {
  projects: Project[];
  stats: import('@/contexts/ProjectsContext').ProjectStats | null;
  loading: boolean;
  error: ProjectError | null;
  hasFetchedWorkspace: boolean;
  fetchProjects: () => Promise<Project[]>;
  refreshProjects: () => Promise<Project[]>;
  createProject: (request: ProjectCreateRequest) => Promise<Project | null>;
  deleteProject: (projectId: string) => Promise<boolean>;
  clearError: () => void;
  isWorkspaceLoading: boolean;
}

export interface UseProjectDetailsReturn {
  project: Project | null;
  loading: boolean;
  error: ProjectError | null;
  assets: ProjectAssetsResponse | null;
  hasFetched: boolean;
  isAssetsLoading: boolean;
  getProject: (includeAssets?: boolean) => Promise<Project | null>;
  updateProject: (request: ProjectUpdateRequest) => Promise<Project | null>;
  getProjectAssets: (assetType?: string, forceRefresh?: boolean) => Promise<ProjectAssetsResponse | null>;
  refreshProject: () => Promise<Project | null>;
  refreshAssets: () => Promise<ProjectAssetsResponse | null>;
  clearError: () => void;
  getCachedAssets: () => ProjectAssetsResponse | null;
  invalidateAssetsCache: () => void;
}

// Enhanced hook for workspace-level project management
export function useWorkspaceProjects(workspaceId?: string): UseWorkspaceProjectsReturn {
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
    clearError,
    isWorkspaceLoading 
  } = useProjectsContext();

  // Auto-fetch projects for this workspace when workspaceId changes
  useEffect(() => {
    if (workspaceId && !loading) {
      fetchProjects(workspaceId);
    }
  }, [workspaceId, fetchProjects, loading]);

  // Memoize computed values for performance
  const projects = useMemo(() => {
    return workspaceId ? (projectsByWorkspace[workspaceId] || []) : [];
  }, [projectsByWorkspace, workspaceId]);

  const stats = useMemo(() => {
    return workspaceId ? statsByWorkspace[workspaceId] || null : null;
  }, [statsByWorkspace, workspaceId]);

  const hasFetchedWorkspace = useMemo(() => {
    return workspaceId ? fetchedWorkspaces.has(workspaceId) : false;
  }, [fetchedWorkspaces, workspaceId]);

  const workspaceLoading = useMemo(() => {
    return workspaceId ? isWorkspaceLoading(workspaceId) : false;
  }, [isWorkspaceLoading, workspaceId]);

  // Memoize functions to prevent re-renders
  const memoizedFetchProjects = useCallback(() => {
    return workspaceId ? fetchProjects(workspaceId) : Promise.resolve([]);
  }, [workspaceId, fetchProjects]);

  const memoizedRefreshProjects = useCallback(() => {
    return workspaceId ? refreshProjects(workspaceId) : Promise.resolve([]);
  }, [workspaceId, refreshProjects]);

  const memoizedCreateProject = useCallback((request: ProjectCreateRequest) => {
    return workspaceId ? createProject(workspaceId, request) : Promise.resolve(null);
  }, [workspaceId, createProject]);

  const memoizedDeleteProject = useCallback((projectId: string) => {
    return workspaceId ? deleteProject(workspaceId, projectId) : Promise.resolve(false);
  }, [workspaceId, deleteProject]);

  return useMemo(() => ({
    projects,
    stats,
    loading,
    error,
    hasFetchedWorkspace,
    fetchProjects: memoizedFetchProjects,
    refreshProjects: memoizedRefreshProjects,
    createProject: memoizedCreateProject,
    deleteProject: memoizedDeleteProject,
    clearError,
    isWorkspaceLoading: workspaceLoading,
  }), [
    projects,
    stats,
    loading,
    error,
    hasFetchedWorkspace,
    memoizedFetchProjects,
    memoizedRefreshProjects,
    memoizedCreateProject,
    memoizedDeleteProject,
    clearError,
    workspaceLoading,
  ]);
}

// Enhanced hook for project details with comprehensive asset management
export function useProjectDetails(workspaceId?: string, projectId?: string): UseProjectDetailsReturn {
  const { 
    getProject,
    updateProject,
    getProjectAssets,
    refreshProjectAssets,
    projectsByWorkspace,
    assetsByProject,
    loading: contextLoading,
    error,
    clearError,
    isProjectAssetsLoading,
    getCachedAssets,
    invalidateAssetsCache
  } = useProjectsContext();
  
  // Get authentication state from useAuth
  const { user: authUser, loading: authLoading } = useAuth();
  
  const [projectState, setProjectState] = useState<{
    project: Project | null;
    fetched: boolean;
    isInitialLoading: boolean;
  }>({
    project: null,
    fetched: false,
    isInitialLoading: false
  });

  // Get cached project from workspace projects if available
  const cachedProject = useMemo(() => {
    if (!workspaceId || !projectId) return null;
    return projectsByWorkspace[workspaceId]?.find(p => p.id === projectId) || null;
  }, [projectsByWorkspace, workspaceId, projectId]);

  // Get cached or state-managed assets
  const assets = useMemo(() => {
    if (!projectId) return null;
    return assetsByProject[projectId] || null;
  }, [assetsByProject, projectId]);

  // Check if assets are currently loading
  const isAssetsLoading = useMemo(() => {
    return projectId ? isProjectAssetsLoading(projectId) : false;
  }, [isProjectAssetsLoading, projectId]);

  // Auto-fetch project details when workspaceId/projectId changes or when auth becomes available
  useEffect(() => {
    if (!workspaceId || !projectId) {
      setProjectState({ 
        project: null, 
        fetched: false, 
        isInitialLoading: false
      });
      return;
    }

    // Don't attempt to fetch if still loading auth or if already authenticated and already fetched
    if (authLoading) {
      console.log('useProjectDetails: Waiting for auth to complete...');
      return;
    }

    // If we already have the project data and auth is stable, don't refetch
    if (projectState.fetched && projectState.project && authUser.isAuthenticated) {
      console.log('useProjectDetails: Project already fetched, skipping...');
      return;
    }

    // Reset state if auth failed and we had a fetch attempt
    if (!authUser.isAuthenticated && projectState.fetched) {
      console.log('useProjectDetails: Auth failed, resetting state');
      setProjectState({ 
        project: null, 
        fetched: false, 
        isInitialLoading: false
      });
      return;
    }

    // Only attempt fetch if authenticated or if we haven't tried yet
    if (!authUser.isAuthenticated && projectState.fetched) {
      return;
    }

    // Fetch project details from API
    const fetchProjectDetails = async () => {
      try {
        setProjectState(prev => ({ ...prev, isInitialLoading: true }));
        console.log(`Fetching project details for ${projectId} in workspace ${workspaceId}`);
        
        // Fetch project first
        const projectData = await getProject(workspaceId, projectId, true);
        console.log('Project data received:', projectData);

        // Then explicitly fetch assets
        const assetsData = await getProjectAssets(workspaceId, projectId);
        console.log('Assets data received:', assetsData);

        setProjectState({
          project: projectData,
          fetched: true,
          isInitialLoading: false
        });
      } catch (error) {
        console.error('Error fetching project details:', error);
        setProjectState({
          project: null,
          fetched: true,
          isInitialLoading: false
        });
      }
    };

    // Only fetch if we haven't fetched yet or if auth state changed to authenticated
    if (!projectState.fetched || (!projectState.project && authUser.isAuthenticated)) {
      console.log('useProjectDetails: Starting fetch...', {
        hasFetched: projectState.fetched,
        hasProject: !!projectState.project,
        isAuthenticated: authUser.isAuthenticated
      });
      fetchProjectDetails();
    }
  }, [workspaceId, projectId, authUser.isAuthenticated, authLoading, projectState.fetched, projectState.project, getProject, getProjectAssets]);

  // Memoized functions with enhanced error handling
  const memoizedGetProject = useCallback(async (includeAssets?: boolean) => {
    if (!workspaceId || !projectId) return null;
    
    const project = await getProject(workspaceId, projectId, includeAssets);
    if (project) {
      setProjectState(prev => ({ ...prev, project, fetched: true }));
    }
    return project;
  }, [workspaceId, projectId, getProject]);

  const memoizedUpdateProject = useCallback(async (request: ProjectUpdateRequest) => {
    if (!workspaceId || !projectId) return null;
    
    const updatedProject = await updateProject(workspaceId, projectId, request);
    if (updatedProject) {
      setProjectState(prev => ({ ...prev, project: updatedProject }));
    }
    return updatedProject;
  }, [workspaceId, projectId, updateProject]);

  const memoizedGetProjectAssets = useCallback(async (assetType?: string, forceRefresh?: boolean) => {
    if (!workspaceId || !projectId) return null;
    
    return getProjectAssets(workspaceId, projectId, assetType, forceRefresh);
  }, [workspaceId, projectId, getProjectAssets]);

  const refreshProject = useCallback(async () => {
    if (!workspaceId || !projectId) return null;
    
    // Don't set loading state for refresh operations
    // This prevents the "Loading..." page from appearing during video generation
    
    // Force fresh fetch without showing loading state
    const projectData = await getProject(workspaceId, projectId, true);

    setProjectState(prev => ({
      ...prev,
      project: projectData,
      fetched: true
    }));

    return projectData;
  }, [workspaceId, projectId, getProject]);

  const refreshAssets = useCallback(async () => {
    if (!workspaceId || !projectId) return null;
    
    return refreshProjectAssets(workspaceId, projectId);
  }, [workspaceId, projectId, refreshProjectAssets]);

  const memoizedGetCachedAssets = useCallback(() => {
    return projectId ? getCachedAssets(projectId) : null;
  }, [projectId, getCachedAssets]);

  const memoizedInvalidateAssetsCache = useCallback(() => {
    if (projectId) {
      invalidateAssetsCache(projectId);
    }
  }, [projectId, invalidateAssetsCache]);
  
  return useMemo(() => ({
    project: projectState.project,
    loading: projectState.isInitialLoading, // Only show loading for initial fetch
    error,
    assets,
    hasFetched: projectState.fetched,
    isAssetsLoading,
    getProject: memoizedGetProject,
    updateProject: memoizedUpdateProject,
    getProjectAssets: memoizedGetProjectAssets,
    refreshProject,
    refreshAssets,
    clearError,
    getCachedAssets: memoizedGetCachedAssets,
    invalidateAssetsCache: memoizedInvalidateAssetsCache,
  }), [
    projectState.project,
    projectState.fetched,
    projectState.isInitialLoading,
    error,
    assets,
    isAssetsLoading,
    memoizedGetProject,
    memoizedUpdateProject,
    memoizedGetProjectAssets,
    refreshProject,
    refreshAssets,
    clearError,
    memoizedGetCachedAssets,
    memoizedInvalidateAssetsCache,
  ]);
}

// For components that need workspace-level project statistics
export function useWorkspaceStats(workspaceId?: string) {
  const { 
    statsByWorkspace, 
    getWorkspaceStats, 
    loading, 
    error 
  } = useProjectsContext();

  const stats = workspaceId ? statsByWorkspace[workspaceId] : null;

  const fetchStats = useCallback(() => {
    return workspaceId ? getWorkspaceStats(workspaceId) : Promise.resolve(null);
  }, [workspaceId, getWorkspaceStats]);

  return {
    stats,
    loading,
    error,
    getWorkspaceStats: fetchStats,
  };
}

/**
 * Hook for monitoring asset loading performance and providing debugging insights
 * 
 * @example
 * ```tsx
 * const { performanceMetrics, isSlowLoading } = useAssetPerformance(projectId);
 * 
 * if (isSlowLoading) {
 *   console.warn('Slow asset loading detected:', performanceMetrics);
 * }
 * ```
 */
export function useAssetPerformance(projectId?: string) {
  const { isProjectAssetsLoading, getCachedAssets } = useProjectsContext();
  const [metrics, setMetrics] = useState<{
    loadStartTime?: number;
    loadEndTime?: number;
    cacheHits: number;
    cacheMisses: number;
    totalRequests: number;
  }>({
    cacheHits: 0,
    cacheMisses: 0,
    totalRequests: 0
  });

  const isLoading = useMemo(() => {
    return projectId ? isProjectAssetsLoading(projectId) : false;
  }, [isProjectAssetsLoading, projectId]);

  const isSlowLoading = useMemo(() => {
    if (!metrics.loadStartTime || !isLoading) return false;
    return Date.now() - metrics.loadStartTime > 3000; // 3 seconds threshold
  }, [metrics.loadStartTime, isLoading]);

  // Track cache performance
  useEffect(() => {
    if (!projectId) return;

    const cached = getCachedAssets(projectId);
    setMetrics(prev => ({
      ...prev,
      totalRequests: prev.totalRequests + 1,
      cacheHits: cached ? prev.cacheHits + 1 : prev.cacheHits,
      cacheMisses: cached ? prev.cacheMisses : prev.cacheMisses + 1
    }));
  }, [projectId, getCachedAssets]);

  // Track loading times
  useEffect(() => {
    if (isLoading && !metrics.loadStartTime) {
      setMetrics(prev => ({ ...prev, loadStartTime: Date.now() }));
    } else if (!isLoading && metrics.loadStartTime && !metrics.loadEndTime) {
      setMetrics(prev => ({ 
        ...prev, 
        loadEndTime: Date.now(),
        loadStartTime: undefined 
      }));
    }
  }, [isLoading, metrics.loadStartTime, metrics.loadEndTime]);

  const performanceMetrics = useMemo(() => ({
    loadingDuration: metrics.loadStartTime && metrics.loadEndTime ? 
      metrics.loadEndTime - metrics.loadStartTime : null,
    cacheHitRate: metrics.totalRequests > 0 ? 
      (metrics.cacheHits / metrics.totalRequests) * 100 : 0,
    ...metrics
  }), [metrics]);

  return {
    performanceMetrics,
    isSlowLoading,
    isLoading
  };
}

/**
 * Advanced hook for bulk asset operations across multiple projects
 * 
 * @example
 * ```tsx
 * const { 
 *   bulkRefreshAssets, 
 *   bulkInvalidateCache, 
 *   getBulkAssetSummary 
 * } = useBulkAssetOperations(workspaceId);
 * 
 * // Refresh assets for multiple projects
 * await bulkRefreshAssets([projectId1, projectId2]);
 * ```
 */
export function useBulkAssetOperations(workspaceId?: string) {
  const { 
    projectsByWorkspace, 
    refreshProjectAssets, 
    invalidateAssetsCache,
    assetsByProject 
  } = useProjectsContext();

  const projects = useMemo(() => {
    return workspaceId ? (projectsByWorkspace[workspaceId] || []) : [];
  }, [projectsByWorkspace, workspaceId]);

  const bulkRefreshAssets = useCallback(async (projectIds?: string[]) => {
    if (!workspaceId) return [];

    const targetProjects = projectIds || projects.map(p => p.id);
    const results = await Promise.allSettled(
      targetProjects.map(projectId => refreshProjectAssets(workspaceId, projectId))
    );

    const successful = results
      .map((result, index) => ({ result, projectId: targetProjects[index] }))
      .filter(({ result }) => result.status === 'fulfilled')
      .map(({ projectId }) => projectId);

    console.log(`Bulk refresh completed: ${successful.length}/${targetProjects.length} successful`);
    return successful;
  }, [workspaceId, projects, refreshProjectAssets]);

  const bulkInvalidateCache = useCallback((projectIds?: string[]) => {
    const targetProjects = projectIds || projects.map(p => p.id);
    targetProjects.forEach(projectId => invalidateAssetsCache(projectId));
    console.log(`Invalidated cache for ${targetProjects.length} projects`);
  }, [projects, invalidateAssetsCache]);

  const getBulkAssetSummary = useCallback(() => {
    return projects.reduce((summary, project) => {
      const assets = assetsByProject[project.id];
      if (assets?.asset_summary) {
        summary.total_videos += assets.asset_summary.total_videos;
        summary.total_audio += assets.asset_summary.total_audio;
        summary.total_lipsync_videos += assets.asset_summary.total_lipsync_videos;
        summary.total_images += assets.asset_summary.total_images;
      }
      return summary;
    }, {
      total_videos: 0,
      total_audio: 0,
      total_lipsync_videos: 0,
      total_images: 0
    });
  }, [projects, assetsByProject]);

  return {
    bulkRefreshAssets,
    bulkInvalidateCache,
    getBulkAssetSummary
  };
}

// Legacy hook for backward compatibility - deprecated, use useWorkspaceProjects instead
export function useProjectsLegacy(workspaceId?: string, autoFetch: boolean = false) {
  
  const {
    projectsByWorkspace,
    loading,
    error,
    fetchProjects,
    createProject: contextCreateProject,
    getProject,
    updateProject: contextUpdateProject,
    deleteProject: contextDeleteProject,
    getProjectAssets,
    getWorkspaceStats,
    statsByWorkspace,
    clearError,
  } = useProjectsContext();

  // Auto-fetch projects for this workspace if requested
  React.useEffect(() => {
    if (autoFetch && workspaceId) {
      fetchProjects(workspaceId);
    }
  }, [autoFetch, workspaceId, fetchProjects]);

  // Get projects for the current workspace
  const projects = workspaceId ? (projectsByWorkspace[workspaceId] || []) : [];
  const stats = workspaceId ? statsByWorkspace[workspaceId] : null;

  // Wrapper functions that include workspaceId
  const createProject = async (request: ProjectCreateRequest) => {
    if (!workspaceId) return null;
    return contextCreateProject(workspaceId, request);
  };

  const updateProject = async (projectId: string, request: ProjectUpdateRequest) => {
    if (!workspaceId) return null;
    return contextUpdateProject(workspaceId, projectId, request);
  };

  const deleteProject = async (projectId: string) => {
    if (!workspaceId) return false;
    return contextDeleteProject(workspaceId, projectId);
  };

  const listProjects = () => {
    if (!workspaceId) return Promise.resolve(null);
    return fetchProjects(workspaceId);
  };

  const refreshProjects = () => {
    if (!workspaceId) return Promise.resolve([]);
    return fetchProjects(workspaceId);
  };

  return {
    // State
    projects,
    loading,
    error,
    stats,
    
    // Actions
    listProjects,
    createProject,
    getProject: (projectId: string, includeAssets?: boolean) => {
      if (!workspaceId) return Promise.resolve(null);
      return getProject(workspaceId, projectId, includeAssets);
    },
    updateProject,
    deleteProject,
    getProjectAssets: (projectId: string, assetType?: string) => {
      if (!workspaceId) return Promise.resolve(null);
      return getProjectAssets(workspaceId, projectId, assetType);
    },
    getWorkspaceStats: () => {
      if (!workspaceId) return Promise.resolve(null);
      return getWorkspaceStats(workspaceId);
    },
    
    // Utilities
    refreshProjects,
    clearError,
  };
} 