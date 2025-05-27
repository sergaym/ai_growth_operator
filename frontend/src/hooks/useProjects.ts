"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { apiClient } from '../services/apiClient';

// Project interfaces matching the backend schemas
export interface ProjectAssetSummary {
  total_videos: number;
  total_audio: number;
  total_images: number; // Keep for compatibility but will always be 0 for projects
  total_lipsync_videos: number;
  latest_asset_created_at?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  workspace_id: string;
  created_by_user_id: string;
  status: 'draft' | 'in_progress' | 'completed' | 'archived';
  thumbnail_url?: string;
  created_at: string;
  updated_at: string;
  last_activity_at: string;
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
  status?: 'draft' | 'in_progress' | 'completed' | 'archived';
  thumbnail_url?: string;
  metadata?: Record<string, any>;
}

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

