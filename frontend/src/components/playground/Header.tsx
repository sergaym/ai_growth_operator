"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Logo } from "@/components/ui/Logo";

// Separate client component for auth-related UI
function AuthStatusSection() {
  // Import the useAuth hook only on the client
  const { useAuth } = require('@/hooks/useAuth');
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    try {
      await logout('/');
      // Show success message with toast or alert (in a real app)
      // We'll just use a simple alert here for demonstration
      alert('Successfully logged out. Redirecting to home page...');
    } catch (error) {
      console.error('Logout failed:', error);
      setIsLoggingOut(false);
    }
  };
  
  return (
    <div className="flex items-center gap-3">
      {/* User status indicator */}
      <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
        <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
        <span>Authenticated</span>
      </div>
      
      <button 
        onClick={handleLogout}
        disabled={isLoggingOut}
        className={`text-sm font-medium px-4 py-2 rounded-md transition-colors ${
          isLoggingOut 
            ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
        }`}
      >
        {isLoggingOut ? 'Signing out...' : 'Sign out'}
      </button>
    </div>
  );
}

export default function PlaygroundHeader() {
  // Client-side only rendering for auth components
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#e6e6e6] py-3">
      <div className="container max-w-4xl mx-auto px-5 md:px-8">
        <div className="flex items-center justify-between">
          {/* Logo and back button in one element */}
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 hover:bg-[#f1f1f1] rounded-md transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            
            <div className="h-5 w-px bg-[#e6e6e6]"></div>
            
            <div className="flex items-center gap-2">
              <Logo size="sm" showText={false} />
              <span className="text-[15px] font-medium text-[#37352f]">
                Playground
              </span>
            </div>
          </div>
          
          {/* Auth status section - only rendered on client side */}
          {isMounted ? <AuthStatusSection /> : <div className="h-9 w-32"></div>}
        </div>
      </div>
    </header>
  );
} 