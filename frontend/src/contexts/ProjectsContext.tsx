"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '../services/apiClient';

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
  status: string;
  workspace_id: string;
  created_at: string;
  updated_at: string;
  last_activity_at: string;
  thumbnail_url?: string;
  asset_summary?: ProjectAssetSummary;
}

export interface ProjectCreateRequest {
  name: string;
  description?: string;
  status?: string;
}

export interface ProjectUpdateRequest {
  name?: string;
  description?: string;
  status?: string;
}

export interface ProjectAsset {
  id: string;
  project_id: string;
  type: string;
  filename: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  created_at: string;
  updated_at: string;
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
}

const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined);

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  
  const [projectsByWorkspace, setProjectsByWorkspace] = useState<{ [workspaceId: string]: Project[] }>({});
  const [statsByWorkspace, setStatsByWorkspace] = useState<{ [workspaceId: string]: ProjectStats }>({});
  const [fetchedWorkspaces, setFetchedWorkspaces] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

