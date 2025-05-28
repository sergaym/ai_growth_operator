"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '../services/apiClient';

// Re-export everything from the context for backward compatibility
export {
  type Workspace,
  type User,
  type SubscriptionPlan,
  type Subscription,
  type WorkspaceWithSubscription,
  useWorkspaceContext as useWorkspace,
} from '@/contexts/WorkspaceContext';

// For components that specifically need only the workspace list
import { useWorkspaceContext } from '@/contexts/WorkspaceContext';

export function useWorkspaces() {
  const { workspaces, loading, error, fetchWorkspaces, hasFetched } = useWorkspaceContext();

  return {
    workspaces,
    loading,
    error,
    hasFetched,
    refetchWorkspaces: fetchWorkspaces,
  };
}

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
