"use client";
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#2d3748] flex items-center justify-center">
      {/* Background elements */}
      <div className="fixed inset-0 z-[-1] pointer-events-none">
        <div className="absolute inset-0 bg-noise opacity-[0.03] mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-radial from-blue-50 via-transparent to-transparent opacity-60"></div>
        <div className="absolute bottom-0 left-0 right-0 h-[150px] bg-gradient-to-t from-blue-50/50 to-transparent"></div>
      </div>
      
      <div className="container max-w-md mx-auto px-6 py-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          {/* Logo */}
          <div className="mx-auto mb-6 relative w-16 h-16">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-red-400 to-amber-400"></div>
            <div className="absolute inset-[4px] bg-white rounded-xl flex items-center justify-center text-red-500 font-bold text-2xl">
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold mb-4 tracking-tight text-slate-800">
            Something Went Wrong
          </h1>
          
          <p className="text-slate-600 mb-8">
            We encountered an error while processing your request. Please try again or return to the home page.
          </p>
          
          {/* Error message - only show in development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
              <p className="text-red-700 font-medium mb-2">Error details:</p>
              <p className="text-red-600 text-sm overflow-auto max-h-32">{error.message}</p>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <div className="relative flex-1">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-200 via-cyan-200 to-blue-200 rounded-lg blur-md"></div>
              <Button 
                onClick={reset}
                className="w-full relative bg-white border border-slate-200 text-blue-600 hover:bg-slate-50 transition-colors shadow-sm"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 4V9H4.58152M19.9381 11C19.446 7.05369 16.0796 4 12 4C8.64262 4 5.76829 6.06817 4.58152 9M4.58152 9H9M20 20V15H19.4185M19.4185 15C18.2317 17.9318 15.3574 20 12 20C7.92038 20 4.55399 16.9463 4.06189 13M19.4185 15H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Try Again
              </Button>
            </div>
            
            <div className="relative flex-1">
              <Link href="/" className="relative block">
                <Button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-md shadow-blue-500/20 hover:shadow-blue-500/30 transition-all">
                  Return to Home
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="mt-12 flex justify-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <div 
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i === 2 ? 'bg-red-400' : 'bg-slate-300'
                }`}
              ></div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
} 