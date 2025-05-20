"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './useAuth';
import { apiClient } from '../services/apiClient';

interface Workspace {
  id: string;
  name: string;
  // Add other workspace fields as needed
}

export function useWorkspaces() {
  const router = useRouter();
  const auth = useAuth();
  const authState = auth.user;
  const authLoading = auth.loading;
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!authState.isAuthenticated) {
      setError('Not authenticated');
      return;
    }

    const fetchWorkspaces = async () => {
      try {
        // Use apiClient for automatic token refresh
        const data = await apiClient(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/workspaces`);
        
        if (Array.isArray(data)) {
          setWorkspaces(data);
        } else {
          setError('Invalid workspace data received');
        }
      } catch (err) {
        setError('Failed to fetch workspaces');
        console.error('Error fetching workspaces:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspaces();
  }, [authState, authLoading]);

  return {
    workspaces,
    loading,
    error
  };
}

function getAccessToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token');
  }
  return null;
}
