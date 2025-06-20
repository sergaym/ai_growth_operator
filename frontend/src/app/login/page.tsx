"use client";

import React, { Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Logo } from "@/components/ui/Logo";
import Link from 'next/link';
import { ArrowDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";

// Create a loading fallback for the Suspense boundary
function LoginFormSkeleton() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#070b1a]">
      <div className="max-w-md w-full space-y-4 bg-[#111827]/80 p-8 rounded-xl shadow-lg border border-white/10 backdrop-blur-sm">
        <div className="flex flex-col items-center">
          <div className="h-10 w-40 bg-gray-800 rounded-lg animate-pulse"></div>
        </div>
        
        <div className="animate-pulse space-y-3">
          <div className="h-12 bg-gray-800 rounded-lg"></div>
          <div className="h-12 bg-gray-800 rounded-lg"></div>
          <div className="h-12 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-lg"></div>
        </div>
      </div>
      
      <div className="mt-10 text-center animate-pulse">
        <div className="h-8 w-64 bg-gray-800 rounded-lg mx-auto"></div>
        <div className="h-12 w-48 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-lg mx-auto mt-4"></div>
      </div>
    </div>
  );
}

// Extract the form into a separate client component
function LoginForm() {
  const router = useRouter();
  const { useAuth } = require('@/hooks/useAuth');
  const { user, login, loading, error: authError } = useAuth();
  const { useState } = React;
  const { useSearchParams } = require('next/navigation');

  // Redirect to playground if already authenticated
  useEffect(() => {
    if (user.isAuthenticated) {
      router.push('/playground');
    }
  }, [user.isAuthenticated, router]);
  
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/playground';
  
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#070b1a] text-white px-4 sm:px-6 relative overflow-hidden">
      {/* Background effects - matching the landing page */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 w-2/3 h-2/3 bg-gradient-to-b from-indigo-500/10 via-purple-500/5 to-transparent blur-3xl opacity-30 rounded-full"></div>
        <div className="absolute -bottom-32 -left-32 w-2/3 h-2/3 bg-gradient-to-t from-blue-500/10 via-indigo-500/5 to-transparent blur-3xl opacity-30 rounded-full"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full space-y-4 bg-[#111827]/80 p-8 rounded-xl shadow-xl border border-white/10 backdrop-blur-sm relative z-10"
      >
        <div className="flex flex-col items-center">
          <Link href="/">
            <Logo size="md" showText={true} />
          </Link>
        </div>
        
        {displayError && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-900/20 border-l-4 border-red-500 text-red-400 p-3 rounded-md shadow-sm"
            role="alert"
          >
            <div className="flex">
              <svg className="h-5 w-5 text-red-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{displayError}</span>
            </div>
          </motion.div>
        )}
        
        <div className="text-lg font-medium mb-1">Email address</div>
        <motion.form 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mt-2 space-y-5" 
          onSubmit={handleSubmit}
        >
          <div className="space-y-5">
            <div>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-lg relative block w-full px-4 py-3 bg-zinc-900 border border-zinc-800 placeholder-zinc-500 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors sm:text-sm"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div className="text-lg font-medium mb-1">Password</div>
            <div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-lg relative block w-full px-4 py-3 bg-zinc-900 border border-zinc-800 placeholder-zinc-500 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors sm:text-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <Button
              type="submit"
              disabled={loading}
              variant="gradient"
              gradient="purple-blue"
              className={`w-full rounded-lg relative overflow-hidden ${loading ? 'text-transparent' : ''}`}
            >
              {loading ? (
                <>
                  <span className="absolute inset-0 flex items-center justify-center text-white">
                    Signing in...
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer-slow" style={{ backgroundSize: '200% 100%' }}></div>
                </>
              ) : (
                'Sign in to continue'
              )}
            </Button>
          </div>
        </motion.form>
        
        <div className="text-center mt-3">
          <Link href="/reset-password" className="text-sm font-medium text-zinc-400 hover:text-zinc-300 transition-colors">
            Forgot your password?
          </Link>
        </div>
      </motion.div>
      
      {/* Badge */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="mt-16 inline-block py-2 px-4 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 text-white/80 text-sm font-medium backdrop-blur-sm relative z-10"
      >
        <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Create Winning Ads with AI Actors
        </span>
      </motion.div>
      
      {/* CTA Section */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.9 }}
        className="text-center max-w-lg mx-auto relative z-10"
      >
        <h2 className="text-2xl md:text-3xl font-bold text-white mt-5 mb-2">
          Don't have an account yet?
        </h2>
        <p className="text-zinc-400 mb-6">
          Generate 100s of winning videos from text. No cameras, no production costs, no hassle.
        </p>
        
        <motion.div 
          animate={{ 
            y: [0, 8, 0],
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 2.5,
            ease: "easeInOut" 
          }}
          className="text-blue-500 my-5"
        >
          <svg className="w-8 h-8 mx-auto" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 4V20M12 20L18 14M12 20L6 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </motion.div>
        
        <Link href="/signup" className="block mx-auto w-fit">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="py-4 px-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl text-lg font-bold text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all duration-300 flex items-center justify-center gap-2"
          >
            Get your first video ad free
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 5L20 12L13 19M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.button>
        </Link>
        
        <p className="mt-4 text-xs text-zinc-500">Less than 1 minute to start • Cancel anytime</p>
      </motion.div>
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