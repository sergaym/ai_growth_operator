"use client";

import React, { Suspense, useState } from 'react';
import { Logo } from "@/components/ui/Logo";
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

// Create a loading fallback for the Suspense boundary
function ResetPasswordSkeleton() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#030712]">
      <div className="max-w-md w-full space-y-4 bg-[#111827]/80 p-8 rounded-xl shadow-lg border border-white/10 backdrop-blur-sm">
        <div className="flex flex-col items-center">
          <div className="h-10 w-40 bg-gray-800 rounded-lg animate-pulse"></div>
        </div>
        
        <div className="h-4 w-3/4 mx-auto bg-gray-800 rounded animate-pulse"></div>
        <div className="h-4 w-1/2 mx-auto bg-gray-800 rounded animate-pulse"></div>
        
        <div className="animate-pulse space-y-3">
          <div className="h-12 bg-gray-800 rounded-lg"></div>
          <div className="h-12 bg-gradient-to-r from-red-500/30 to-amber-500/30 rounded-lg"></div>
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

