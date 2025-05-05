"use client";

import React, { Suspense, useState } from 'react';
import { Logo } from "@/components/ui/Logo";
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

// Create a loading fallback for the Suspense boundary
function ResetPasswordSkeleton() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#070b1a]">
      <div className="max-w-md w-full space-y-4 bg-[#111827]/80 p-8 rounded-xl shadow-lg border border-white/10 backdrop-blur-sm">
        <div className="flex flex-col items-center">
          <div className="h-10 w-40 bg-gray-800 rounded-lg animate-pulse"></div>
        </div>
        
        <div className="h-4 w-3/4 mx-auto bg-gray-800 rounded animate-pulse"></div>
        <div className="h-4 w-1/2 mx-auto bg-gray-800 rounded animate-pulse"></div>
        
        <div className="animate-pulse space-y-3">
          <div className="h-12 bg-gray-800 rounded-lg"></div>
          <div className="h-12 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
}

// Main component for the reset password form
function ResetPasswordForm() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Email is required');
      return;
    }
    
    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    
    setError('');
    setIsSubmitting(true);
    
    try {
      // This would be replaced with your actual API call
      // await resetPasswordService.requestReset(email);
      
      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsSubmitted(true);
    } catch (err) {
      setError('Failed to send reset password email. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#070b1a] text-white px-4 sm:px-6 relative overflow-hidden">
      {/* Background effects - matching the login page */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 w-2/3 h-2/3 bg-gradient-to-b from-indigo-500/10 via-purple-500/5 to-transparent blur-3xl opacity-30 rounded-full"></div>
        <div className="absolute -bottom-32 -left-32 w-2/3 h-2/3 bg-gradient-to-t from-blue-500/10 via-indigo-500/5 to-transparent blur-3xl opacity-30 rounded-full"></div>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full space-y-5 bg-[#111827]/80 p-8 rounded-xl shadow-xl border border-white/10 backdrop-blur-sm relative z-10"
      >
        <div className="flex flex-col items-center">
          <Link href="/">
            <Logo size="md" showText={true} />
          </Link>
        </div>
        
        {isSubmitted ? (
          // Success state
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-5 py-6"
          >
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-white">Check your email</h2>
            <p className="text-zinc-400">
              We've sent a password reset link to <span className="text-white font-medium">{email}</span>
            </p>
            
            <div className="pt-4">
              <Link href="/login">
                <button className="flex items-center justify-center gap-2 text-blue-400 hover:text-blue-300 font-medium transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                  Back to login
                </button>
              </Link>
            </div>
          </motion.div>
        ) : (
          // Form state
          <>
            <div className="text-center space-y-2 mb-2">
              <h2 className="text-2xl font-bold text-white">Reset your password</h2>
              <p className="text-zinc-400">
                Enter the email address associated with your account,
                and we'll send you a link to reset your password.
              </p>
            </div>
            
            {error && (
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
                  <span>{error}</span>
                </div>
              </motion.div>
            )}
            
            <motion.form 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="space-y-5" 
              onSubmit={handleSubmit}
            >
              <div>
                <div className="text-lg font-medium mb-1">Email address</div>
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
              
              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white transition-all duration-150 ease-in-out shadow-lg ${
                    isSubmitting 
                      ? 'bg-blue-800/50 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-blue-500/20 hover:shadow-blue-500/30 hover:translate-y-[-2px]'
                  }`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    'Send reset link'
                  )}
                </button>
              </div>
            </motion.form>
            
            <div className="text-center pt-2">
              <Link href="/login" className="text-sm font-medium text-zinc-400 hover:text-zinc-300 transition-colors flex items-center justify-center gap-1">
                <ArrowLeft className="w-4 h-4" />
                Back to login
              </Link>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

// Main page component with suspense boundary
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordSkeleton />}>
      <ResetPasswordForm />
    </Suspense>
  );
} 