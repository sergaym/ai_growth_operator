"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

// Mobile menu component
function MobileMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
          
          {/* Menu panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-[280px] bg-[#030712] border-l border-white/10 z-50"
          >
            <div className="p-4 flex justify-between items-center border-b border-white/10">
              <Logo size="sm" showText={false} />
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <Link
                href="/login?callbackUrl=/become-actor"
                onClick={onClose}
                className="w-full px-4 py-3 rounded-xl border border-white/10 hover:bg-white/[0.1] transition-all text-base font-medium text-white flex items-center justify-center"
              >
                Become Our Actor
              </Link>
              <Link
                href="/login?callbackUrl=/playground"
                onClick={onClose}
                className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-red-500 to-amber-500 hover:from-red-600 hover:to-amber-600 transition-all text-base font-medium text-white shadow-lg shadow-red-500/20 hover:shadow-red-500/30 hover:translate-y-[-2px] flex items-center justify-center"
              >
                Start Playing
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Handle scroll event
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? "py-3 bg-[#030712]/80 backdrop-blur-md border-b border-white/5 shadow-md" 
          : "py-5 bg-transparent"
      }`}
    >
      <div className="container max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between">
          {/* Logo (icon only) */}
          <Link href="/" className="z-10">
            <Logo size={isScrolled ? "sm" : "md"} showText={false} />
          </Link>

          {/* Desktop Navigation Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/login?callbackUrl=/become-actor" className="w-auto">
              <Button 
                className="px-6 py-3 rounded-xl border border-white/10 hover:bg-white/[0.1] transition-all text-base font-medium text-white"
              >
                Become Our Actor
              </Button>
            </Link>
            <Link href="/login?callbackUrl=/playground" className="w-auto">
              <Button 
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-amber-500 hover:from-red-600 hover:to-amber-600 transition-all text-base font-medium text-white shadow-lg shadow-red-500/20 hover:shadow-red-500/30 hover:translate-y-[-2px]"
              >
                Start Playing
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-2 hover:bg-white/5 rounded-lg transition-colors text-white/80 hover:text-white"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />
    </header>
  );
} 