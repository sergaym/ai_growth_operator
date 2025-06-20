"use client";
import React from "react";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { Workflow } from "@/components/landing/Workflow";
import { Demo } from "@/components/landing/Demo";
import { TechStack } from "@/components/landing/TechStack";
import { Footer } from "@/components/landing/Footer";
import { Header } from "@/components/landing/Header";
import { PageBackground } from "@/components/ui/PageBackground";
import "./globals.css";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#070b1a] text-white overflow-x-hidden">
      {/* Background component */}
      <PageBackground />
      
      <Header />
      
      <main className="relative">
        <Hero />
        
        {/* Demo Section - Temporarily disabled */}
        {/* <Demo /> */}

        {/* Commenting out these components temporarily */}
        {/* <Features /> */}
        {/* <Workflow /> */}
        {/* <TechStack /> */}
      </main>
      <Footer />
    </div>
  );
} 