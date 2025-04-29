"use client";
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { PageBackground } from "@/components/ui/PageBackground";

export default function NotFound() {
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
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-blue-500 to-cyan-400"></div>
            <div className="absolute inset-[4px] bg-white rounded-xl flex items-center justify-center text-blue-600 font-bold text-2xl">
              404
            </div>
          </div>
          
          <h1 className="text-4xl font-bold mb-4 tracking-tight text-slate-800">
            Page Not Found
          </h1>
          
          <p className="text-slate-600 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-200 via-cyan-200 to-blue-200 rounded-lg blur-md"></div>
            <Link href="/" className="relative block">
              <Button className="w-full bg-white border border-slate-200 text-blue-600 hover:bg-slate-50 transition-colors shadow-sm">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 12H19M5 12L11 18M5 12L11 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Return to Home
              </Button>
            </Link>
          </div>
          
          {/* Decorative elements */}
          <div className="mt-12 flex justify-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <div 
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i === 2 ? 'bg-blue-500' : 'bg-slate-300'
                }`}
              ></div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
} 