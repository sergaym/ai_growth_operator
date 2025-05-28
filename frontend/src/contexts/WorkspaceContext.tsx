"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '../services/apiClient';

// Workspace interfaces
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

interface WorkspaceContextType {
  // Global workspace list state
  workspaces: Workspace[];
  loading: boolean;
  error: string | null;
  hasFetched: boolean;
  
  // Individual workspace state
  currentWorkspace: WorkspaceWithSubscription | null;
  workspaceUsers: User[];
  workspaceLoading: boolean;
  workspaceError: string | null;
  
  // Actions
  fetchWorkspaces: () => Promise<void>;
  getWorkspaceDetails: (workspaceId: string) => Promise<WorkspaceWithSubscription | null>;
  updateWorkspaceName: (workspaceId: string, newName: string) => Promise<Workspace | null>;
  getWorkspaceUsers: (workspaceId: string) => Promise<User[] | null>;
  addUserToWorkspace: (workspaceId: string, userId: string, role?: string) => Promise<boolean>;
  removeUserFromWorkspace: (workspaceId: string, userId: string) => Promise<boolean>;
  clearError: () => void;
  clearWorkspaceError: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  
  // Global workspace list state
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);
  
  // Individual workspace state
  const [currentWorkspace, setCurrentWorkspace] = useState<WorkspaceWithSubscription | null>(null);
  const [workspaceUsers, setWorkspaceUsers] = useState<User[]>([]);
  const [workspaceLoading, setWorkspaceLoading] = useState(false);
  const [workspaceError, setWorkspaceError] = useState<string | null>(null);

  // Fetch all workspaces
  const fetchWorkspaces = useCallback(async () => {
    if (!user.isAuthenticated) {
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
        setHasFetched(true);
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
  }, [user.isAuthenticated]);

  // Get specific workspace details
  const getWorkspaceDetails = useCallback(async (workspaceId: string): Promise<WorkspaceWithSubscription | null> => {
    if (!workspaceId || !user.isAuthenticated) {
      return null;
    }

    try {
      setWorkspaceLoading(true);
      setWorkspaceError(null);

      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/workspaces/${workspaceId}`;
      const data = await apiClient<WorkspaceWithSubscription>(url);
      
      setCurrentWorkspace(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch workspace details';
      setWorkspaceError(errorMessage);
      console.error('Error fetching workspace details:', err);
      return null;
    } finally {
      setWorkspaceLoading(false);
    }
  }, [user.isAuthenticated]);

  // Update workspace name
  const updateWorkspaceName = useCallback(async (workspaceId: string, newName: string): Promise<Workspace | null> => {
    if (!workspaceId || !user.isAuthenticated) {
      return null;
    }

    try {
      setWorkspaceLoading(true);
      setWorkspaceError(null);

      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/workspaces/${workspaceId}/name?new_name=${encodeURIComponent(newName)}`;
      const updatedWorkspace = await apiClient<Workspace>(url, {
        method: 'PUT',
      });

      // Update local state
      setWorkspaces(prev => prev.map(ws => ws.id === workspaceId ? { ...ws, ...updatedWorkspace } : ws));
      if (currentWorkspace && currentWorkspace.id === workspaceId) {
        setCurrentWorkspace({ ...currentWorkspace, ...updatedWorkspace });
      }

      return updatedWorkspace;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update workspace name';
      setWorkspaceError(errorMessage);
      console.error('Error updating workspace name:', err);
      return null;
    } finally {
      setWorkspaceLoading(false);
    }
  }, [user.isAuthenticated, currentWorkspace]);

  // Get workspace users
  const getWorkspaceUsers = useCallback(async (workspaceId: string): Promise<User[] | null> => {
    if (!workspaceId || !user.isAuthenticated) {
      return null;
    }

    try {
      setWorkspaceLoading(true);
      setWorkspaceError(null);

      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/workspaces/${workspaceId}/users`;
      const users = await apiClient<User[]>(url);
      
      setWorkspaceUsers(users);
      return users;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch workspace users';
      setWorkspaceError(errorMessage);
      console.error('Error fetching workspace users:', err);
      return null;
    } finally {
      setWorkspaceLoading(false);
    }
  }, [user.isAuthenticated]);

  // Add user to workspace
  const addUserToWorkspace = useCallback(async (
    workspaceId: string,
    userId: string, 
    role: string = 'member'
  ): Promise<boolean> => {
    if (!workspaceId || !user.isAuthenticated) {
      return false;
    }

    try {
      setWorkspaceLoading(true);
      setWorkspaceError(null);

      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/workspaces/${workspaceId}/users/${userId}?role=${role}`;
      await apiClient(url, { method: 'POST' });

      // Refresh workspace users
      await getWorkspaceUsers(workspaceId);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add user to workspace';
      setWorkspaceError(errorMessage);
      console.error('Error adding user to workspace:', err);
      return false;
    } finally {
      setWorkspaceLoading(false);
    }
  }, [user.isAuthenticated, getWorkspaceUsers]);

  // Remove user from workspace
  const removeUserFromWorkspace = useCallback(async (workspaceId: string, userId: string): Promise<boolean> => {
    if (!workspaceId || !user.isAuthenticated) {
      return false;
    }

    try {
      setWorkspaceLoading(true);
      setWorkspaceError(null);

      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/workspaces/${workspaceId}/users/${userId}`;
      await apiClient(url, { method: 'DELETE' });

      // Refresh workspace users
      await getWorkspaceUsers(workspaceId);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove user from workspace';
      setWorkspaceError(errorMessage);
      console.error('Error removing user from workspace:', err);
      return false;
    } finally {
      setWorkspaceLoading(false);
    }
  }, [user.isAuthenticated, getWorkspaceUsers]);

  // Clear errors
  const clearError = useCallback(() => setError(null), []);
  const clearWorkspaceError = useCallback(() => setWorkspaceError(null), []);

  // Auto-fetch workspaces when user becomes authenticated
  useEffect(() => {
    if (user.isAuthenticated && !hasFetched && !loading) {
      fetchWorkspaces();
    }
  }, [user.isAuthenticated, hasFetched, loading, fetchWorkspaces]);

  const value: WorkspaceContextType = {
    // Global workspace list state
    workspaces,
    loading,
    error,
    hasFetched,
    
    // Individual workspace state
    currentWorkspace,
    workspaceUsers,
    workspaceLoading,
    workspaceError,
    
    // Actions
    fetchWorkspaces,
    getWorkspaceDetails,
    updateWorkspaceName,
    getWorkspaceUsers,
    addUserToWorkspace,
    removeUserFromWorkspace,
    clearError,
    clearWorkspaceError,
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspaceContext() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspaceContext must be used within a WorkspaceProvider');
  }
  return context;
} 