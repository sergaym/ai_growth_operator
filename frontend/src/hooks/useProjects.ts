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

  // Auto-fetch project details when workspaceId/projectId changes
  useEffect(() => {
    if (!workspaceId || !projectId) {
      setProjectState({ 
        project: null, 
        assets: null, 
        fetched: false, 
        fetchedAssets: false,
        isInitialLoading: false
      });
      return;
    }

    // If we already have the project data, don't show loading
    if (projectState.fetched && projectState.project) {
      return;
    }

    // Always fetch fresh project details from API for project pages
    const fetchProjectDetails = async () => {
      try {
        setProjectState(prev => ({ ...prev, isInitialLoading: true }));
        console.log(`Fetching project details for ${projectId} in workspace ${workspaceId}`);
        
        // Fetch project with assets included
        const [projectData, assetsData] = await Promise.all([
          getProject(workspaceId, projectId, true),
          getProjectAssets(workspaceId, projectId)
        ]);

        console.log('Project data received:', projectData);
        console.log('Assets data received:', assetsData);

        setProjectState({
          project: projectData,
          assets: assetsData,
          fetched: true,
          fetchedAssets: true,
          isInitialLoading: false
        });
      } catch (error) {
        console.error('Error fetching project details:', error);
        setProjectState({
          project: null,
          assets: null,
          fetched: true,
          fetchedAssets: true,
          isInitialLoading: false
        });
      }
    };

    // Only fetch if we haven't fetched yet or if the project/workspace changed
    if (!projectState.fetched) {
      fetchProjectDetails();
    }
  }, [workspaceId, projectId, projectState.fetched, getProject, getProjectAssets]);

  // Memoized functions
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

  const memoizedGetProjectAssets = useCallback(async (assetType?: string) => {
    if (!workspaceId || !projectId) return null;
    
    const assets = await getProjectAssets(workspaceId, projectId, assetType);
    if (assets) {
      setProjectState(prev => ({ ...prev, assets, fetchedAssets: true }));
    }
    return assets;
  }, [workspaceId, projectId, getProjectAssets]);

  const refreshProject = useCallback(async () => {
    if (!workspaceId || !projectId) return null;
    
    // Don't set loading state for refresh operations
    // This prevents the "Loading..." page from appearing during video generation
    
    // Force fresh fetch without showing loading state
    const [projectData, assetsData] = await Promise.all([
      getProject(workspaceId, projectId, true),
      getProjectAssets(workspaceId, projectId)
    ]);

    setProjectState(prev => ({
      ...prev,
      project: projectData,
      assets: assetsData,
      fetched: true,
      fetchedAssets: true
    }));

    return projectData;
  }, [workspaceId, projectId, getProject, getProjectAssets]);
  
  return useMemo(() => ({
    project: projectState.project,
    loading: projectState.isInitialLoading, // Only show loading for initial fetch
    error,
    assets: projectState.assets,
    hasFetched: projectState.fetched,
    getProject: memoizedGetProject,
    updateProject: memoizedUpdateProject,
    getProjectAssets: memoizedGetProjectAssets,
    refreshProject,
    clearError,
  }), [
    projectState.project,
    projectState.assets,
    projectState.fetched,
    projectState.isInitialLoading,
    error,
    memoizedGetProject,
    memoizedUpdateProject,
    memoizedGetProjectAssets,
    refreshProject,
    clearError,
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

  return {
    stats,
    loading,
    error,
    getWorkspaceStats: () => workspaceId ? getWorkspaceStats(workspaceId) : Promise.resolve(null),
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