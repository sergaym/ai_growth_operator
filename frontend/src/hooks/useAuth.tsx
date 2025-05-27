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

// Create the AuthContext
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser>({ isAuthenticated: false, user: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const getUserProfile = useCallback(async (accessToken: string): Promise<void> => {
    try {
      const userData = await apiClient<AuthUserData>(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/me`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      setUser({
        isAuthenticated: true,
        user: {
          id: userData.id,
          email: userData.email,
          first_name: userData.first_name,
          last_name: userData.last_name,
          workspaces: userData.workspaces || []
        }
      });
    } catch (err) {
      console.error('Error fetching user profile:', err);
      throw err;
    }
  }, []);

