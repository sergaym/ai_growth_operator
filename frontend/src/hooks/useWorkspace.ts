"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './useAuth';
import { apiClient } from '../services/apiClient';

// Workspace interfaces matching the backend schemas
export interface Workspace {
  id: string;
  name: string;
  type: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  stripe_customer_id?: string;
}

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role?: string;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionPlan {
  id: number;
  name: string;
  description?: string;
  price: number;
  currency: string;
  billing_interval: string;
  max_users: number;
}

export interface Subscription {
  id: number;
  workspace_id: string;
  plan_id: number;
  status: string;
  stripe_subscription_id?: string;
  start_date: string;
  end_date?: string;
  plan: SubscriptionPlan;
}

export interface WorkspaceWithSubscription extends Workspace {
  active_subscription?: Subscription;
}

export function useWorkspaces() {
  const router = useRouter();
  const auth = useAuth();
  const authState = auth.user;
  const authLoading = auth.loading;
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkspaces = useCallback(async () => {
    if (authLoading) {
      return;
    }

    if (!authState.isAuthenticated) {
      setError('User not authenticated. Please log in.');
      setLoading(false); 
      return;
    }

    setLoading(true); 
    try {
      const data = await apiClient<Workspace[]>(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/workspaces/`);
      
      if (Array.isArray(data)) {
        setWorkspaces(data);
        setError(null); 
      } else {
        console.error('Invalid workspace data received:', data);
        setError('Received invalid data format for workspaces.');
      }
    } catch (err) {
      console.error('Error fetching workspaces:', err);
      setError('Failed to fetch workspaces. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [authState, authLoading]); 

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]); 

  return {
    workspaces,
    loading,
    error,
    refetchWorkspaces: fetchWorkspaces 
  };
}

export function useWorkspace(workspaceId?: string) {
  const { user } = useAuth();
  const [workspace, setWorkspace] = useState<WorkspaceWithSubscription | null>(null);
  const [workspaceUsers, setWorkspaceUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get workspace details with subscription
  const getWorkspaceDetails = useCallback(async (): Promise<WorkspaceWithSubscription | null> => {
    if (!workspaceId || !user.isAuthenticated) {
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/workspaces/${workspaceId}`;
      const data = await apiClient<WorkspaceWithSubscription>(url);
      
      setWorkspace(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch workspace details';
      setError(errorMessage);
      console.error('Error fetching workspace details:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [workspaceId, user.isAuthenticated]);

  // Update workspace name
  const updateWorkspaceName = useCallback(async (newName: string): Promise<Workspace | null> => {
    if (!workspaceId || !user.isAuthenticated) {
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/workspaces/${workspaceId}/name?new_name=${encodeURIComponent(newName)}`;
      const updatedWorkspace = await apiClient<Workspace>(url, {
        method: 'PUT',
      });

      // Update local state
      if (workspace) {
        setWorkspace({ ...workspace, ...updatedWorkspace });
      }

      return updatedWorkspace;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update workspace name';
      setError(errorMessage);
      console.error('Error updating workspace name:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [workspaceId, user.isAuthenticated, workspace]);

  // Get workspace users
  const getWorkspaceUsers = useCallback(async (): Promise<User[] | null> => {
    if (!workspaceId || !user.isAuthenticated) {
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/workspaces/${workspaceId}/users`;
      const users = await apiClient<User[]>(url);
      
      setWorkspaceUsers(users);
      return users;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch workspace users';
      setError(errorMessage);
      console.error('Error fetching workspace users:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [workspaceId, user.isAuthenticated]);

  // Add user to workspace
  const addUserToWorkspace = useCallback(async (
    userId: string, 
    role: string = 'member'
  ): Promise<boolean> => {
    if (!workspaceId || !user.isAuthenticated) {
      return false;
    }

    try {
      setLoading(true);
      setError(null);

      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/workspaces/${workspaceId}/users/${userId}?role=${role}`;
      await apiClient(url, { method: 'POST' });

      // Refresh workspace users
      await getWorkspaceUsers();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add user to workspace';
      setError(errorMessage);
      console.error('Error adding user to workspace:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [workspaceId, user.isAuthenticated, getWorkspaceUsers]);

  // Remove user from workspace
  const removeUserFromWorkspace = useCallback(async (userId: string): Promise<boolean> => {
    if (!workspaceId || !user.isAuthenticated) {
      return false;
    }

    try {
      setLoading(true);
      setError(null);

      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/workspaces/${workspaceId}/users/${userId}`;
      await apiClient(url, { method: 'DELETE' });

      // Refresh workspace users
      await getWorkspaceUsers();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove user from workspace';
      setError(errorMessage);
      console.error('Error removing user from workspace:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [workspaceId, user.isAuthenticated, getWorkspaceUsers]);

  // Auto-fetch workspace details when workspaceId changes
  useEffect(() => {
    if (workspaceId && user.isAuthenticated) {
      getWorkspaceDetails();
    }
  }, [workspaceId, user.isAuthenticated, getWorkspaceDetails]);

  return {
    // State
    workspace,
    workspaceUsers,
    loading,
    error,

    // Actions
    getWorkspaceDetails,
    updateWorkspaceName,
    getWorkspaceUsers,
    addUserToWorkspace,
    removeUserFromWorkspace,

    // Utilities
    refreshWorkspace: getWorkspaceDetails,
    refreshUsers: getWorkspaceUsers,
    clearError: () => setError(null),
  };
}

function getAccessToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token');
  }
  return null;
}
