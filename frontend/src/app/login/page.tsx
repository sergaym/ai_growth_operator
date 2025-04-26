"use client";

import React, { useState, FormEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import { Logo } from "@/components/ui/Logo";
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/playground';
  
  const { login, loading, error: authError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }
    
    // Clear any previous errors
    setError('');
    
    // Attempt login using the auth hook
    await login(email, password, callbackUrl);
  };
  
