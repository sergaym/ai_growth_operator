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
    <div className="min-h-screen bg-[#030712] text-white overflow-x-hidden">
      {/* Global background elements */}
      <div className="fixed inset-0 z-[-1] pointer-events-none">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02] mix-blend-overlay"></div>
        <div className="absolute bottom-0 left-0 right-0 h-[150px] bg-gradient-to-t from-black to-transparent"></div>
      </div>
      
      <Header />
      
      <main className="relative pt-24">
        <Hero />
        <Features />
        <Workflow />
        <Demo />
        <TechStack />
      </main>
      <Footer />
    </div>
  );
} 