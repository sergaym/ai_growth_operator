import React from 'react';
import Link from 'next/link';
import { Logo } from "@/components/ui/Logo";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#e6e6e6] py-3">
      <div className="container max-w-4xl mx-auto px-5 md:px-8">
        <div className="flex items-center justify-between">
          {/* Logo and back button in one element */}
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 hover:bg-[#f1f1f1] rounded-md transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            
            <div className="h-5 w-px bg-[#e6e6e6]"></div>
            
            <div className="flex items-center gap-2">
              <Logo size="sm" showText={false} />
              <span className="text-[15px] font-medium text-[#37352f]">
                Playground
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
} 