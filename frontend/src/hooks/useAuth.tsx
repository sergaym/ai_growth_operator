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

  // Check if the user is authenticated on mount (client side only)
  useEffect(() => {
    // Prevent multiple initialization calls
    if (isInitialized) return;

    const checkAuth = async () => {
      try {
        // First check if we have an access token
        const accessToken = getAccessToken();
        if (!accessToken) {
          setUser({ isAuthenticated: false, user: null });
          setLoading(false);
          setIsInitialized(true);
          return;
        }

        // Try to validate the token with the backend
        try {
          await getUserProfile(accessToken);
          setLoading(false);
          setIsInitialized(true);
        } catch (err) {
          console.log('Token validation failed, trying to refresh');
          // If token is invalid, try to refresh it
          const newToken = await refreshAccessToken();
          if (!newToken) {
            setUser({ isAuthenticated: false, user: null });
            setLoading(false);
            setIsInitialized(true);
            return;
          }
          // Try to get profile with the new token
          await getUserProfile(newToken);
          setLoading(false);
          setIsInitialized(true);
        }
      } catch (err) {
        console.error('Auth check error:', err);
        setUser({ isAuthenticated: false, user: null });
        setLoading(false);
        setIsInitialized(true);
      }
    };

    // Only run in the browser
    if (typeof window !== 'undefined') {
      checkAuth();
    } else {
      // In SSR, just set loading to false
      setLoading(false);
      setIsInitialized(true);
    }
  }, [getUserProfile, isInitialized]);

  // Login function
  const login = useCallback(async (email: string, password: string, callbackUrl?: string) => {
    try {
      setLoading(true);
      setError(null);

      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);
      
      const data = await apiClient<AuthData>(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData
      });

      // Store tokens securely (dual storage strategy)
      if (typeof window !== 'undefined' && data.access_token) {
        // 1. Store access token in localStorage for easy client-side access
        window.localStorage.setItem('access_token', data.access_token);
        
        // 2. Store refresh token in localStorage if provided
        if (data.refresh_token) {
          window.localStorage.setItem('refresh_token', data.refresh_token);
        }
        
        // 3. Also set auth-token in cookies for middleware (non-HttpOnly)
        document.cookie = `auth-token=${data.access_token}; path=/; max-age=${60 * 60 * 24}; SameSite=Lax`;  // 24 hours
        
        // Map the backend user data to match our AuthUserData interface
        const formattedUser: AuthUserData = {
          id: data.user.id,
          email: data.user.email,
          first_name: data.user.first_name,
          last_name: data.user.last_name,
          workspaces: data.user.workspaces || []
        };
        setUser({ isAuthenticated: true, user: formattedUser });
      }
      
      // Force a hard refresh to ensure all auth state is properly set
      if (typeof window !== 'undefined') {
        // Redirect to the callback URL or dashboard
        const redirectUrl = callbackUrl || '/dashboard';
        window.location.href = redirectUrl;
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback((redirectUrl?: string) => {
    try {
      setLoading(true);
      
      // Clear all client-side auth state
      if (typeof window !== 'undefined') {
        // Clear localStorage tokens
        window.localStorage.removeItem('access_token');
        window.localStorage.removeItem('refresh_token');
        
        // Clear all potential auth cookies
        document.cookie = 'auth-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        document.cookie = 'refresh_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        document.cookie = 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      }
      
      // Reset user state
      setUser({ isAuthenticated: false, user: null });
      if (redirectUrl) {
        router.push(redirectUrl);
      }
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Helper: get access token
  const getAccessToken = () => {
    if (typeof window !== 'undefined') {
      return window.localStorage.getItem('access_token');
    }
    return null;
  };

  // Helper: refresh access token using the centralized function from apiClient.ts
  const refreshAccessToken = async (): Promise<string | null> => {
    try {
      console.log('Calling centralized token refresh');
      
      // Call the centralized refresh function from apiClient.ts
      const newToken = await apiRefreshAccessToken();
      
      if (newToken) {
        console.log('Token refresh successful, updating user state');
        // After successful token refresh, try to get user data
        try {
          // Get user profile with the new token
          const userData = await apiClient<AuthUserData>(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/me`);
          
          // Update the user state
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
        } catch (profileError) {
          console.error('Error fetching profile after token refresh:', profileError);
          // If we can't fetch the profile, the token might be invalid or there are other issues
          // Keep the user authenticated but note the error
        }
        
        return newToken;
      }
      
      // If token refresh failed, clear auth state
      console.log('Token refresh returned null, clearing auth state');
      setUser({ isAuthenticated: false, user: null });
      return null;
    } catch (e) {
      console.error('Token refresh error:', e);
      await logout('/login');
      return null;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    login,
    logout,
    getAccessToken,
    refreshAccessToken,
    getUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use the AuthContext
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}