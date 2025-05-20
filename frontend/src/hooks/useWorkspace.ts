"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './useAuth';

interface Workspace {
  id: string;
  name: string;
  // Add other workspace fields as needed
}

export function useWorkspaces() {
  const router = useRouter();
  const { user: authState, loading: authLoading } = useAuth();
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
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/workspaces`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch workspaces');
        }

        const data = await response.json();

        console.log(data)

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
