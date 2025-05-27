"use client";

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient, refreshAccessToken as apiRefreshAccessToken } from '../services/apiClient';

interface AuthResponse {
  success: boolean;
  message: string;
}

interface AuthUserData {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  workspaces: Array<{
    id: string;
    name: string;
    type: string;
  }>;
}

interface AuthUser {
  isAuthenticated: boolean;
  user: AuthUserData | null;
}

interface AuthData {
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    workspaces: Array<any>;
  };
  access_token: string;
  refresh_token: string;
}

interface AuthContextType {
  user: AuthUser;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string, callbackUrl?: string) => Promise<boolean>;
  logout: (redirectUrl?: string) => boolean;
  getAccessToken: () => string | null;
  refreshAccessToken: () => Promise<string | null>;
  getUserProfile: (accessToken: string) => Promise<void>;
}

