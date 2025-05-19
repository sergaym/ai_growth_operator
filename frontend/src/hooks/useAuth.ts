"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface AuthResponse {
  success: boolean;
  message: string;
}

interface AuthUser {
  isAuthenticated: boolean;
}

interface AuthData {
  user: {
    id: string;
    email: string;
    // Add other user fields as needed
  };
  access_token: string;
  refresh_token: string;
}

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser>({ isAuthenticated: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if the user is authenticated on mount (client side only)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // First check if we have an access token
        const accessToken = getAccessToken();
        if (!accessToken) {
          setUser({ isAuthenticated: false });
          return;
        }

        // Try to validate the token with the backend
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/me`,
          {
            credentials: 'include',
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          }
        );

        if (!response.ok) {
          // If token is invalid, try to refresh it
          const refreshToken = await refreshAccessToken();
          if (!refreshToken) {
            setUser({ isAuthenticated: false });
            return;
          }
        }

        setUser({ isAuthenticated: true });
      } catch (err) {
        console.error('Auth check error:', err);
        setUser({ isAuthenticated: false });
      } finally {
        setLoading(false);
      }
    };

    // Only run in the browser
    if (typeof window !== 'undefined') {
      checkAuth();
    } else {
      // In SSR, just set loading to false
      setLoading(false);
    }
  }, []);

  // Login function
  const login = useCallback(async (email: string, password: string, callbackUrl?: string) => {
    try {
      setLoading(true);
      setError(null);

      // Call the backend signin API
      const params = new URLSearchParams();
      params.append('username', email);
      params.append('password', password);
      
      const response = await fetch(process.env.NEXT_PUBLIC_API_URL + '/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        credentials: 'include',  // Important: include cookies in the request
        body: params.toString(),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      
      // Store access token in memory (refresh token is in httpOnly cookie)
      if (typeof window !== 'undefined' && data.access_token) {
        window.localStorage.setItem('access_token', data.access_token);
      }
      
      // Update the auth state
      setUser({ isAuthenticated: true });
      
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
  }, [router]);

  // Logout function
  const logout = useCallback((redirectUrl?: string) => {
    try {
      setLoading(true);
      
      // Clear client-side auth state
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('access_token');
        // Clear the auth cookie
        document.cookie = 'auth-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      }
      setUser({ isAuthenticated: false });
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

  // Helper: refresh access token using refresh token (in httpOnly cookie)
  const refreshAccessToken = async (): Promise<string | null> => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 401) {
          // Token expired or invalid
          await logout('/login');
          return null;
        }
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();
      if (data.access_token) {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('access_token', data.access_token);
        }
        setUser({ isAuthenticated: true });
        return data.access_token;
      }
      return null;
    } catch (e) {
      console.error('Token refresh error:', e);
      await logout('/login');
      return null;
    }
  };

  return {
    user,
    loading,
    error,
    login,
    logout,
    getAccessToken,
    refreshAccessToken,
  };
} 