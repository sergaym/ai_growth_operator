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

