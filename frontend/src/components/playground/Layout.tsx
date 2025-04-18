import React, { ReactNode } from 'react';
import PlaygroundHeader from './Header';

interface PlaygroundLayoutProps {
  title: string;
  description?: string;
  error?: string | null;
  children: ReactNode;
}

export default function PlaygroundLayout({ 
  title, 
  description, 
  error, 
  children 
}: PlaygroundLayoutProps) {
  return (
    <div className="min-h-screen bg-[#ffffff] text-[#37352f]">
      {/* Simple minimal background */}
      <div className="fixed inset-0 z-[-1] pointer-events-none">
        <div className="absolute inset-0 bg-[#ffffff] opacity-100"></div>
        <div className="absolute inset-0 bg-[url('/subtle-dots.png')] opacity-[0.015]"></div>
      </div>
      
      <PlaygroundHeader />
      
      <main className="container max-w-4xl mx-auto px-5 md:px-8 py-10">
        {/* Notion-style page title */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2 text-[#37352f]">
            {title}
          </h1>
          {description && (
            <p className="text-[#6b7280] text-lg">
              {description}
            </p>
          )}
        </div>
        
        {/* Display any API errors */}
        {error && (
          <div className="mb-8 p-4 bg-[#ffebe8] border border-[#ffc1ba] rounded-md text-[#e03e21]">
            <p className="font-medium">Error: {error}</p>
          </div>
        )}
        
        {/* Content with Notion-style cards */}
        <div className="space-y-12">
          {children}
        </div>
      </main>
    </div>
  );
} 