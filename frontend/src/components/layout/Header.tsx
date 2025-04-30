"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Logo } from "@/components/ui/Logo";
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronRight } from 'lucide-react';

// Create a client-side only header component that uses the auth hook
function AuthenticatedHeader() {
  // Only import the auth hook on the client
  const { useAuth } = require('@/hooks/useAuth');
  const { user, logout } = useAuth();
  
  const handleLogout = async () => {
    await logout('/');
  };
  
  return (
    <div>
      {user.isAuthenticated ? (
        <button 
          onClick={handleLogout}
          className="text-sm text-white/80 hover:text-white font-medium transition-colors"
        >
          Sign out
        </button>
      ) : (
        <Link 
          href="/login" 
          className="text-sm bg-gradient-to-r from-red-500 to-amber-500 text-white font-medium px-4 py-2 rounded-lg hover:from-red-600 hover:to-amber-600 transition-all shadow-lg shadow-red-500/20 hover:shadow-red-500/30 hover:translate-y-[-1px]"
        >
          Sign in
        </Link>
      )}
    </div>
  );
}

// The main header component
export default function Header() {
  // Only use authentication on the client-side
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
          
          {/* Auth actions - only rendered after client-side mount */}
          {isMounted ? (
            <AuthenticatedHeader />
          ) : (
            /* Empty placeholder to avoid layout shift */
            <div className="h-6 w-16"></div>
          )}
        </div>
      </div>
    </header>
  );
} 