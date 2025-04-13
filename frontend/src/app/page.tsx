import React from "react";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { Workflow } from "@/components/landing/Workflow";
import { Demo } from "@/components/landing/Demo";
import { TechStack } from "@/components/landing/TechStack";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <main>
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