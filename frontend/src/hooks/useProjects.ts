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