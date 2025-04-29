"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/button";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

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

          {/* Navigation Buttons */}
          <div className="flex items-center gap-4">
            <Link href="/become-actor">
              <Button 
                variant="outline" 
                className="border-white/20 bg-white/[0.05] text-white hover:bg-white/10 hover:text-white"
              >
                Become Our Actor
              </Button>
            </Link>
            <Link href="/start-playing">
              <Button 
                variant="outline" 
                className="border-white/20 bg-white/[0.05] text-white hover:bg-white/10 hover:text-white"
              >
                Start Playing
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
} 