"use client";

import React, { Suspense } from 'react';
import { Logo } from "@/components/ui/Logo";
import Link from 'next/link';
import { ArrowDown } from 'lucide-react';
import { motion } from 'framer-motion';

// Create a loading fallback for the Suspense boundary
function LoginFormSkeleton() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#030712]">
      <div className="max-w-md w-full space-y-4 bg-[#111827]/80 p-8 rounded-xl shadow-lg border border-white/10 backdrop-blur-sm">
        <div className="flex flex-col items-center">
          <div className="h-10 w-40 bg-gray-800 rounded-lg animate-pulse"></div>
        </div>
        
        <div className="animate-pulse space-y-3">
          <div className="h-12 bg-gray-800 rounded-lg"></div>
          <div className="h-12 bg-gray-800 rounded-lg"></div>
          <div className="h-12 bg-gradient-to-r from-red-500/30 to-amber-500/30 rounded-lg"></div>
        </div>
      </div>
      
      <div className="mt-10 text-center animate-pulse">
        <div className="h-8 w-64 bg-gray-800 rounded-lg mx-auto"></div>
        <div className="h-12 w-48 bg-gradient-to-r from-red-500/30 to-amber-500/30 rounded-lg mx-auto mt-4"></div>
      </div>
    </div>
  );
}

// Extract the form into a separate client component
function LoginForm() {
  // Client-side hooks
  const { useState } = React;
  const { useSearchParams } = require('next/navigation');
  const { useAuth } = require('@/hooks/useAuth');
  
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/playground';
  
  const { login, loading, error: authError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
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
  
  // Display either form validation error or auth error
  const displayError = error || authError;
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div className="flex flex-col items-center">
          <Logo size="md" showText={true} />
          <h2 className="mt-6 text-center text-2xl font-semibold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Access the playground and other protected areas
          </p>
        </div>
        
        {displayError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{displayError}</span>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-t-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-b-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                loading 
                  ? 'bg-blue-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
              }`}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </div>
        </form>
        
        <div className="text-center mt-4">
          <Link href="/" className="text-sm text-blue-600 hover:text-blue-500">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

// Main page component with suspense boundary
export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFormSkeleton />}>
      <LoginForm />
    </Suspense>
  );
} 