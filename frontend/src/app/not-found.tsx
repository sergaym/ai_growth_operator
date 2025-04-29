"use client";
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { PageBackground } from "@/components/ui/PageBackground";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#030712] text-white overflow-x-hidden">
      {/* Background component */}
      <PageBackground />
      
      <div className="container max-w-md mx-auto px-6 py-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          {/* Logo */}
          <div className="mx-auto mb-6 relative w-20 h-20">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-red-500 to-amber-500"></div>
            <div className="absolute inset-[4px] bg-[#030712] rounded-xl flex items-center justify-center text-white font-bold text-3xl">
              404
            </div>
          </div>
          
          <h1 className="text-4xl font-bold mb-4 tracking-tight text-slate-800">
            Page Not Found
          </h1>
          
          <p className="text-zinc-400 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          
          <div className="flex flex-col gap-4">
            <Link href="/" className="relative block">
              <Button 
                className="w-full bg-gradient-to-r from-red-500 to-amber-500 text-white hover:from-red-600 hover:to-amber-600 transition-all shadow-lg shadow-red-500/20 hover:shadow-red-500/30 hover:translate-y-[-2px]"
              >
                Return to Home
              </Button>
            </Link>
            
            <Link href="/start-playing" className="relative block">
              <Button 
                className="w-full border border-white/10 hover:bg-white/[0.1] transition-all text-white"
              >
                Start Playing
              </Button>
            </Link>
          </div>
          
          {/* Decorative elements */}
          <div className="mt-12 flex justify-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`w-2 h-2 rounded-full ${
                  i === 2 ? 'bg-red-500' : 'bg-zinc-600'
                }`}
              ></motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
} 