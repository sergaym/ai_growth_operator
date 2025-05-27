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
      const data = await apiClient(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/workspaces/`);
      
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

function getAccessToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token');
  }
  return null;
}
