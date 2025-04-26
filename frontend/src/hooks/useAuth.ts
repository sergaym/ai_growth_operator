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

