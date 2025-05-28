"use client";

import React, { useEffect, useCallback, useMemo } from 'react';

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
import { 
  useProjectsContext, 
  type Project, 
  type ProjectCreateRequest,
  type ProjectUpdateRequest 
} from '@/contexts/ProjectsContext';

export interface ProjectListResponse {
  projects: Project[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// Enhanced return types for better type inference
export interface UseWorkspaceProjectsReturn {
  projects: Project[];
  stats: import('@/contexts/ProjectsContext').ProjectStats | null;
  loading: boolean;
  error: string | null;
  hasFetchedWorkspace: boolean;
  fetchProjects: () => Promise<Project[]>;
  refreshProjects: () => Promise<Project[]>;
  createProject: (request: ProjectCreateRequest) => Promise<Project | null>;
  deleteProject: (projectId: string) => Promise<boolean>;
  clearError: () => void;
}

export interface UseProjectDetailsReturn {
  loading: boolean;
  error: string | null;
  getProject: (includeAssets?: boolean) => Promise<Project | null>;
  updateProject: (request: ProjectUpdateRequest) => Promise<Project | null>;
  getProjectAssets: (assetType?: string) => Promise<import('@/contexts/ProjectsContext').ProjectAssetsResponse | null>;
  clearError: () => void;
}

// For components that need to work with projects in a specific workspace
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
    clearError 
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
  ]);
}

// For components that need to work with a specific project
export function useProjectDetails(workspaceId?: string, projectId?: string): UseProjectDetailsReturn {
  const { 
    getProject,
    updateProject,
    getProjectAssets,
    loading,
    error,
    clearError 
  } = useProjectsContext();
  
  const memoizedGetProject = useCallback((includeAssets?: boolean) => {
    if (!workspaceId || !projectId) return Promise.resolve(null);
    return getProject(workspaceId, projectId, includeAssets);
  }, [workspaceId, projectId, getProject]);

  const memoizedUpdateProject = useCallback((request: ProjectUpdateRequest) => {
    if (!workspaceId || !projectId) return Promise.resolve(null);
    return updateProject(workspaceId, projectId, request);
  }, [workspaceId, projectId, updateProject]);

  const memoizedGetProjectAssets = useCallback((assetType?: string) => {
    if (!workspaceId || !projectId) return Promise.resolve(null);
    return getProjectAssets(workspaceId, projectId, assetType);
  }, [workspaceId, projectId, getProjectAssets]);
  
  return useMemo(() => ({
    loading,
    error,
    getProject: memoizedGetProject,
    updateProject: memoizedUpdateProject,
    getProjectAssets: memoizedGetProjectAssets,
    clearError,
  }), [
    loading,
    error,
    memoizedGetProject,
    memoizedUpdateProject,
    memoizedGetProjectAssets,
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
  const createProject = async (request: any) => {
    if (!workspaceId) return null;
    return contextCreateProject(workspaceId, request);
  };

  const updateProject = async (projectId: string, request: any) => {
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