"use client";
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Test404Page() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#2d3748] flex items-center justify-center">
      <div className="container max-w-md mx-auto px-6 py-12 text-center">
        <h1 className="text-3xl font-bold mb-6 text-slate-800">Test 404 Page</h1>
        
        <p className="text-slate-600 mb-8">
          Click the button below to navigate to a non-existent route and see the 404 page in action.
        </p>
        
        <div className="space-y-4">
          <Link href="/this-route-does-not-exist" className="block">
            <Button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white">
              Go to non-existent route
            </Button>
          </Link>
          
          <Link href="/" className="block">
            <Button variant="outline" className="w-full">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
} 