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

