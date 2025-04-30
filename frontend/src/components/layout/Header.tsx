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

// Mobile menu component
function MobileMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
          
          {/* Menu panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-[280px] bg-[#030712] border-l border-white/10 z-50"
          >
            <div className="p-4 flex justify-between items-center border-b border-white/10">
              <Logo size="sm" showText={false} />
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            
            <nav className="p-4">
              <div className="space-y-2">
                {[
                  { label: 'Dashboard', href: '/dashboard' },
                  { label: 'Create Video', href: '/create' },
                  { label: 'Templates', href: '/templates' },
                  { label: 'Settings', href: '/settings' },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 text-white/80 hover:text-white transition-colors"
                    onClick={onClose}
                  >
                    <span className="text-sm font-medium">{item.label}</span>
                    <ChevronRight className="w-4 h-4 text-white/40" />
                  </Link>
                ))}
              </div>
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
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
    <header className="sticky top-0 z-40 bg-[#030712]/80 backdrop-blur-lg border-b border-white/10">
      <div className="container max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and back button in one element */}
          <div className="flex items-center gap-3">
            <Link 
              href="/" 
              className="p-2 hover:bg-white/5 rounded-lg transition-colors text-white/80 hover:text-white"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            
            <div className="h-5 w-px bg-white/10"></div>
            
            <Link href="/" className="flex items-center gap-2 group">
              <Logo size="sm" showText={false} />
              <span className="text-[15px] font-medium text-white/80 group-hover:text-white transition-colors">
                Playground
              </span>
            </Link>
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