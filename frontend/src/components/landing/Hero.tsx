"use client";
import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center py-20 overflow-hidden bg-black">
      {/* Background effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 w-3/4 h-3/4 bg-gradient-to-b from-blue-600/20 to-purple-600/0 blur-3xl opacity-30 rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-3/4 h-3/4 bg-gradient-to-t from-indigo-600/20 to-purple-600/0 blur-3xl opacity-30 rounded-full"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          {/* Left content - Text and CTA */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex-1 text-center md:text-left"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-block py-1 px-3 mb-6 text-sm font-medium rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300"
            >
              Introducing AI Growth Operator
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight"
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-200 to-white">
                Automate & Optimize
              </span>
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                Your Growth Marketing
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-lg text-gray-300 mb-8 max-w-xl"
            >
              A sophisticated AI agent that runs and optimizes your user acquisition campaigns end-to-end, learning and adapting without manual intervention.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start"
            >
              <Link href="#demo">
                <button className="px-8 py-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium transition-all shadow-lg shadow-blue-600/20 w-full sm:w-auto">
                  Try Demo
                </button>
              </Link>
              <Link href="#workflow">
                <button className="px-8 py-3 rounded-full bg-transparent border border-gray-700 hover:border-blue-500 text-white font-medium transition-all w-full sm:w-auto">
                  How It Works
                </button>
              </Link>
            </motion.div>
          </motion.div>
          
          {/* Right content - Video Showcase */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex-1 relative"
          >
            <div className="relative w-full h-full rounded-2xl overflow-hidden border border-gray-800 shadow-2xl shadow-blue-500/10">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 opacity-30 blur-sm rounded-2xl"></div>
              <div className="relative w-full aspect-video bg-gray-900 rounded-2xl overflow-hidden flex items-center justify-center">
                {/* Video or Mockup Placeholder */}
                <div className="relative w-full h-full">
                  <div className="absolute inset-0 bg-black/40 z-10 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-blue-500/80 flex items-center justify-center cursor-pointer hover:bg-blue-600 transition-colors">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 5.14V19.14L19 12.14L8 5.14Z" fill="white"/>
                      </svg>
                    </div>
                  </div>
                  <img 
                    src="/mockup.jpg" 
                    alt="AI Growth Operator Demo" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
            
