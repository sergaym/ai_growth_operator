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
