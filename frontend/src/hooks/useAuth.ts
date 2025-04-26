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

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser>({ isAuthenticated: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if the user is authenticated on mount
  useEffect(() => {
    const checkAuth = () => {
      try {
        // Check for auth cookie presence using document.cookie
        // In a real app, you'd validate the token with your backend
        const hasAuthCookie = document.cookie
          .split('; ')
          .some(cookie => cookie.startsWith('auth-token='));
        
        setUser({ isAuthenticated: hasAuthCookie });
      } catch (err) {
        console.error('Auth check error:', err);
        setUser({ isAuthenticated: false });
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = useCallback(async (email: string, password: string, callbackUrl?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Call the login API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data: AuthResponse = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      
      // Update user state
      setUser({ isAuthenticated: true });
      
      // Redirect to the callback URL if provided
      if (callbackUrl) {
        router.push(callbackUrl);
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
  const logout = useCallback(async (redirectUrl?: string) => {
    try {
      setLoading(true);
      
      // Call the logout API
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Logout failed');
      }
      
      // Update user state
      setUser({ isAuthenticated: false });
      
      // Redirect if URL provided
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

  return {
    user,
    loading,
    error,
    login,
    logout,
  };
} 