"use client";
import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative pt-32 md:pt-36 pb-24 md:pb-32 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 w-2/3 h-2/3 bg-gradient-to-b from-indigo-500/10 via-purple-500/5 to-transparent blur-3xl opacity-30 rounded-full"></div>
        <div className="absolute -bottom-32 -left-32 w-2/3 h-2/3 bg-gradient-to-t from-blue-500/10 via-indigo-500/5 to-transparent blur-3xl opacity-30 rounded-full"></div>
      </div>

      <div className="container max-w-7xl mx-auto px-6 relative z-10">
        {/* Top badge */}
        <div className="text-center lg:text-left mb-0.5 md:mb-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-block py-2 px-4 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 text-white/80 text-sm font-medium backdrop-blur-sm"
          >
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              The Future of Ad Creation Is Here
            </span>
          </motion.div>
        </div>

        {/* Main content */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 md:gap-10 pt-4">
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
                Create winning
              </span>
              <br />
              <span className="inline-block bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-500 bg-clip-text text-transparent pb-1">
                ads with AI Actors
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-lg text-zinc-400 mb-6"
            >
              Generate 100s of winning videos from text. No cameras, no production costs, no hassle.
            </motion.p>
                        
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
            >
              <Link href="/login?callbackUrl=/playground">
                <Button 
                  variant="gradient" 
                  gradient="purple-blue" 
                  size="lg"
                  className="text-lg font-medium rounded-xl group"
                >
                  Get your first video ad generated
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
          
          {/* Right content - Video Showcase */}
          <motion.div 
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex-1 relative max-w-lg mx-auto lg:max-w-none"
          >
            <div className="relative">
              {/* Decorative gradient glow */}
              <div className="absolute -inset-3 bg-gradient-to-r from-purple-500/30 via-blue-500/20 to-indigo-500/30 rounded-2xl blur-2xl opacity-30"></div>
              
              <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/50 bg-black backdrop-blur-sm">
                {/* Browser-like top bar */}
                <div className="absolute top-0 inset-x-0 h-8 bg-black/80 backdrop-blur-md flex items-center px-3 border-b border-white/5 z-10">
                  <div className="flex space-x-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/90"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500/90"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/90"></div>
                  </div>
                  <div className="mx-auto text-xs text-white/60 font-medium">AI Ad Creator</div>
                </div>
                
                <div className="relative aspect-[16/9] bg-black rounded-b-2xl overflow-hidden">
                  {/* Video or Mockup with play button overlay */}
                  <div className="relative w-full h-full">
                    <div className="absolute inset-0 bg-black/40 z-10 flex items-center justify-center">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-300 shadow-lg">
                        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M8 5.14V19.14L19 12.14L8 5.14Z" fill="white"/>
                        </svg>
                      </div>
                    </div>
                    {/* Placeholder image with gradient background */}
                    <div className="w-full h-full bg-gradient-to-br from-gray-900 to-black">
                      <div className="w-full h-full flex items-center justify-center opacity-20">
                        <svg className="w-1/3 h-1/3 text-white/30" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M4 8H2V4C2 3.46957 2.21071 2.96086 2.58579 2.58579C2.96086 2.21071 3.46957 2 4 2H8V4H4V8Z"></path>
                          <path d="M20 8H22V4C22 3.46957 21.7893 2.96086 21.4142 2.58579C21.0391 2.21071 20.5304 2 20 2H16V4H20V8Z"></path>
                          <path d="M20 20H16V22H20C20.5304 22 21.0391 21.7893 21.4142 21.4142C21.7893 21.0391 22 20.5304 22 20V16H20V20Z"></path>
                          <path d="M4 20H8V22H4C3.46957 22 2.96086 21.7893 2.58579 21.4142C2.21071 21.0391 2 20.5304 2 20V16H4V20Z"></path>
                          <path d="M12 9C12.7956 9 13.5587 9.31607 14.1213 9.87868C14.6839 10.4413 15 12.2044 15 12C15 12.7956 14.6839 13.5587 14.1213 14.1213C13.5587 14.6839 12.7956 15 12 15C11.2044 15 10.4413 14.6839 9.87868 14.1213C9.31607 13.5587 9 12.7956 9 12C9 11.2044 9.31607 10.4413 9.87868 9.87868C10.4413 9.31607 11.2044 9 12 9Z"></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Stats card */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1 }}
                className="absolute bottom-4 right-0 z-30 translate-x-1/3"
              >
                <div className="bg-white/[0.08] backdrop-blur-lg rounded-xl py-2 px-3 border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.2)] flex items-center gap-2">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center shadow-md shadow-purple-500/20">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 8V12L15 15M3 12C3 13.1819 3.23279 14.3522 3.68508 15.4442C4.13738 16.5361 4.80031 17.5282 5.63604 18.364C6.47177 19.1997 7.46392 19.8626 8.55585 20.3149C9.64778 20.7672 10.8181 21 12 21C13.1819 21 14.3522 20.7672 15.4442 20.3149C16.5361 19.8626 17.5282 19.1997 18.364 18.364C19.1997 17.5282 19.8626 16.5361 20.3149 15.4442C20.7672 14.3522 21 13.1819 21 12C21 9.61305 20.0518 7.32387 18.364 5.63604C16.6761 3.94821 14.3869 3 12 3C9.61305 3 7.32387 3.94821 5.63604 5.63604C3.94821 7.32387 3 9.61305 3 12Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-zinc-400">From Text to Video</div>
                    <div className="text-xl font-bold text-white tracking-tight">5 min <span className="text-green-400 text-sm ml-0.5">↓</span></div>
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