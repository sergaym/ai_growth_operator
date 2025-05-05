"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Logo } from "@/components/ui/Logo";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      name: "Twitter",
      href: "#",
      icon: (
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
          <path d="M22 4.01c-1 .49-1.98.689-3 .99-1.121-1.265-2.783-1.335-4.38-.737S11.977 6.323 12 8v1c-3.245.083-6.135-1.395-8-4 0 0-4.182 7.433 4 11-1.872 1.247-3.739 2.088-6 2 3.308 1.803 6.913 2.423 10.034 1.517 3.58-1.04 6.522-3.723 7.651-7.742a13.84 13.84 0 0 0 .497-3.753C20.18 7.773 21.692 5.25 22 4.009z" />
        </svg>
      ),
    },
    {
      name: "GitHub",
      href: "#",
      icon: (
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
        </svg>
      ),
    },
    {
      name: "LinkedIn",
      href: "#",
      icon: (
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
      ),
    },
  ];

  return (
    <footer className="bg-[#070b1a] border-t border-white/5 text-white pt-24 pb-12 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-repeat opacity-[0.015]"></div>
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/20 to-transparent"></div>
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-[radial-gradient(circle_at_center,#5b3bff_1%,transparent_35%)] opacity-[0.07] blur-2xl"></div>
      </div>
      
      <div className="container max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Newsletter section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-20"
        >
          <div className="relative p-8 rounded-2xl overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/[0.08] via-purple-500/[0.08] to-indigo-500/[0.08]"></div>
            
            {/* Micro grid pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:20px_20px]"></div>
            
            <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div className="max-w-md">
                <h3 className="text-2xl font-bold mb-4">Stay up to date</h3>
                <p className="text-zinc-400">Get the latest news and updates on our AI marketing technology</p>
              </div>
              
              <div className="w-full md:w-auto">
                <div className="relative flex">
                  <input 
                    type="email" 
                    placeholder="Enter your email" 
                    className="py-3 pl-4 pr-36 bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder:text-zinc-500 w-full md:w-auto focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                  <button className="absolute right-1.5 top-1.5 px-4 py-1.5 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-lg text-white font-medium transition-all">
                    Subscribe
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Bottom section with copyright */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center">
        <p className="text-zinc-500 text-sm mt-4">
            &copy; {currentYear} AI Growth Operator. All rights reserved.
          </p>
          {/* Social links */}
          <div className="flex space-x-5 mb-6">
            {socialLinks.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-zinc-400 hover:text-white transition-colors w-10 h-10 bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-xl flex items-center justify-center group"
              >
                <span className="sr-only">{item.name}</span>
                <motion.div
                  whileHover={{ 
                    scale: 1.2,
                    transition: { duration: 0.2 } 
                  }}
                  className="text-zinc-400 group-hover:text-purple-400"
                >
                  {item.icon}
                </motion.div>
              </a>
            ))}
          </div>

          <div className="flex items-center gap-6">
            <Link href="#" className="text-zinc-500 hover:text-white text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="text-zinc-500 hover:text-white text-sm transition-colors">
              Terms of Service
            </Link>
            <Link href="#" className="text-zinc-500 hover:text-white text-sm transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
} 