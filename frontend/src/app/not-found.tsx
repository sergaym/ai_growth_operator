"use client";
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { PageBackground } from "@/components/ui/PageBackground";
import { ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#070b1a] text-white overflow-x-hidden">
      {/* Background component */}
      <PageBackground />
      
      {/* Background effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 w-2/3 h-2/3 bg-gradient-to-b from-indigo-500/10 via-purple-500/5 to-transparent blur-3xl opacity-30 rounded-full"></div>
        <div className="absolute -bottom-32 -left-32 w-2/3 h-2/3 bg-gradient-to-t from-blue-500/10 via-indigo-500/5 to-transparent blur-3xl opacity-30 rounded-full"></div>
      </div>
      
      <div className="container max-w-md mx-auto px-6 py-12 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          {/* 404 Badge */}
          <div className="mx-auto mb-6 relative w-20 h-20">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500"></div>
            <div className="absolute inset-[4px] bg-[#070b1a] rounded-xl flex items-center justify-center text-white font-bold text-3xl">
              404
            </div>
          </div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-4xl font-bold mb-4 tracking-tight"
          >
            <span className="inline-block bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-500 bg-clip-text text-transparent pb-1">
              Page Not Found
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-zinc-400 mb-8"
          >
            The page you're looking for doesn't exist or has been moved.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex flex-col gap-4"
          >
            <Link href="/" className="relative block">
              <Button 
                variant="gradient" 
                gradient="purple-blue" 
                size="lg"
                className="w-full font-medium rounded-xl group"
              >
                Return to Home
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
          
          {/* Decorative elements */}
          <div className="mt-12 flex justify-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`w-2 h-2 rounded-full ${
                  i === 2 ? 'bg-purple-500' : 'bg-zinc-600'
                }`}
              ></motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
} 