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

