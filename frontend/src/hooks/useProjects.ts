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

  // Get projects for the current workspace
  const projects = workspaceId ? (projectsByWorkspace[workspaceId] || []) : [];
  const stats = workspaceId ? statsByWorkspace[workspaceId] : null;
  const hasFetchedWorkspace = workspaceId ? fetchedWorkspaces.has(workspaceId) : false;

  return {
    projects,
    stats,
    loading,
    error,
    hasFetchedWorkspace,
    fetchProjects: () => workspaceId ? fetchProjects(workspaceId) : Promise.resolve([]),
    refreshProjects: () => workspaceId ? refreshProjects(workspaceId) : Promise.resolve([]),
    createProject: (request: any) => workspaceId ? createProject(workspaceId, request) : Promise.resolve(null),
    deleteProject: (projectId: string) => workspaceId ? deleteProject(workspaceId, projectId) : Promise.resolve(false),
    clearError,
  };
}

// For components that need to work with a specific project
export function useProjectDetails(workspaceId?: string, projectId?: string) {
  const { 
    getProject,
    updateProject,
    getProjectAssets,
    loading,
    error,
    clearError 
  } = useProjectsContext();
  
  return {
    loading,
    error,
    getProject: (includeAssets?: boolean) => {
      if (!workspaceId || !projectId) return Promise.resolve(null);
      return getProject(workspaceId, projectId, includeAssets);
    },
    updateProject: (request: any) => {
      if (!workspaceId || !projectId) return Promise.resolve(null);
      return updateProject(workspaceId, projectId, request);
    },
    getProjectAssets: (assetType?: string) => {
      if (!workspaceId || !projectId) return Promise.resolve(null);
      return getProjectAssets(workspaceId, projectId, assetType);
    },
    clearError,
  };
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