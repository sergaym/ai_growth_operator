"use client";
import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative pt-16 md:pt-24 pb-24 md:pb-32 overflow-hidden">
      {/* Background effects - subtle dot pattern with vibrant accent spheres */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 w-2/3 h-2/3 bg-gradient-to-b from-blue-600/10 via-purple-600/5 to-transparent blur-3xl opacity-30 rounded-full"></div>
        <div className="absolute -bottom-32 -left-32 w-2/3 h-2/3 bg-gradient-to-t from-red-500/10 via-amber-500/5 to-transparent blur-3xl opacity-30 rounded-full"></div>
      </div>

      <div className="container max-w-7xl mx-auto px-6 relative z-10">
        {/* Top badge - inspired by Revolut badging */}
        <div className="text-center mb-10 md:mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-block py-2 px-4 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 text-white/80 text-sm font-medium backdrop-blur-sm"
          >
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Introducing AI Growth Operator
            </span>
          </motion.div>
        </div>

        {/* Main content with split view like ramp.com */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10 md:gap-16 pt-4">
          {/* Left content - Text and CTA */}
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="flex-1 text-center lg:text-left max-w-xl mx-auto lg:mx-0"
          >
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-6 leading-[1.1] tracking-tight"
            >
              <span className="text-white">
                Automate
              </span>
              <br />
              <span className="inline-block bg-gradient-to-r from-red-400 via-amber-400 to-blue-500 bg-clip-text text-transparent pb-1">
                Growth Marketing
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-lg text-zinc-400 mb-10"
            >
              An intelligent AI agent that runs your user acquisition campaigns end-to-end, optimizing in real-time for maximum ROI.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
            >
              <Link
                href="/playground"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-amber-500 hover:from-red-600 hover:to-amber-600 transition-all text-base font-medium text-white shadow-lg shadow-red-500/20 hover:shadow-red-500/30 hover:translate-y-[-2px] flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.13 7.9799L5.5 7.9999C3 7.9999 2 8.9999 2 11.4999V16.9999C2 19.4999 3 20.4999 5.5 20.4999H12.5" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M17 13.99V3.99C17 2.89 16.1 1.99 15 1.99H8C6.9 1.99 6 2.89 6 3.99V7.99" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M19.5 13.01L22 13L19.5 22" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Try The Playground
              </Link>
              <Link
                href="#features"
                className="px-6 py-3 rounded-xl border border-white/10 hover:bg-white/[0.1] transition-all text-base font-medium text-white flex items-center justify-center w-full sm:w-auto"
              >
                Learn More
              </Link>
            </motion.div>
          </motion.div>
          
          {/* Right content - Video Showcase with glossy effects */}
          <motion.div 
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex-1 relative max-w-lg mx-auto lg:max-w-none"
          >
            <div className="relative">
              {/* Decorative gradient glow */}
              <div className="absolute -inset-3 bg-gradient-to-r from-amber-500/30 via-red-500/20 to-blue-500/30 rounded-2xl blur-2xl opacity-30"></div>
              
              <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/50 bg-black backdrop-blur-sm">
                {/* Browser-like top bar */}
                <div className="absolute top-0 inset-x-0 h-8 bg-black/80 backdrop-blur-md flex items-center px-3 border-b border-white/5 z-10">
                  <div className="flex space-x-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/90"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500/90"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/90"></div>
                  </div>
                  <div className="mx-auto text-xs text-white/60 font-medium">AI Growth Operator</div>
                </div>
                
                <div className="relative aspect-[16/9] bg-black rounded-b-2xl overflow-hidden">
                  {/* Video or Mockup with play button overlay */}
                  <div className="relative w-full h-full">
                    <div className="absolute inset-0 bg-black/40 z-10 flex items-center justify-center">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-r from-red-500 to-amber-500 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-300 shadow-lg shadow-red-500/30">
                        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M8 5.14V19.14L19 12.14L8 5.14Z" fill="white"/>
                        </svg>
                      </div>
                    </div>
                    {/* Placeholder image with gradient background instead of referencing a missing image */}
                    <div className="w-full h-full bg-gradient-to-br from-gray-900 to-black">
                      <div className="w-full h-full flex items-center justify-center opacity-20">
                        <svg className="w-1/3 h-1/3 text-white/30" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M4 8H2V4C2 3.46957 2.21071 2.96086 2.58579 2.58579C2.96086 2.21071 3.46957 2 4 2H8V4H4V8Z"></path>
                          <path d="M20 8H22V4C22 3.46957 21.7893 2.96086 21.4142 2.58579C21.0391 2.21071 20.5304 2 20 2H16V4H20V8Z"></path>
                          <path d="M20 20H16V22H20C20.5304 22 21.0391 21.7893 21.4142 21.4142C21.7893 21.0391 22 20.5304 22 20V16H20V20Z"></path>
                          <path d="M4 20H8V22H4C3.46957 22 2.96086 21.7893 2.58579 21.4142C2.21071 21.0391 2 20.5304 2 20V16H4V20Z"></path>
                          <path d="M12 9C12.7956 9 13.5587 9.31607 14.1213 9.87868C14.6839 10.4413 15 11.2044 15 12C15 12.7956 14.6839 13.5587 14.1213 14.1213C13.5587 14.6839 12.7956 15 12 15C11.2044 15 10.4413 14.6839 9.87868 14.1213C9.31607 13.5587 9 12.7956 9 12C9 11.2044 9.31607 10.4413 9.87868 9.87868C10.4413 9.31607 11.2044 9 12 9Z"></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Stats card - moved outside the video container to overlay at the bottom-right corner */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1 }}
                className="absolute bottom-4 right-0 z-30 translate-x-1/3"
              >
                <div className="bg-white/[0.08] backdrop-blur-lg rounded-xl py-2 px-3 border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.2)] flex items-center gap-2">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-red-500 flex items-center justify-center shadow-md shadow-amber-500/20">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 8C19.6569 8 21 6.65685 21 5C21 3.34315 19.6569 2 18 2C16.3431 2 15 3.34315 15 5C15 6.65685 16.3431 8 18 8Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M6 15C7.65685 15 9 13.6569 9 12C9 10.3431 7.65685 9 6 9C4.34315 9 3 10.3431 3 12C3 13.6569 4.34315 15 6 15Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M18 22C19.6569 22 21 20.6569 21 19C21 17.3431 19.6569 16 18 16C16.3431 16 15 17.3431 15 19C15 20.6569 16.3431 22 18 22Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M8.59 13.51L15.42 17.49" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M15.41 6.51L8.59 10.49" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-zinc-400">Average Improvement</div>
                    <div className="text-xl font-bold text-white tracking-tight">37% <span className="text-green-400 text-sm ml-0.5">↑</span></div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
} 