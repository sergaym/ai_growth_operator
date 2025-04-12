import React from "react";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { Workflow } from "@/components/landing/Workflow";
import { TechStack } from "@/components/landing/TechStack";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <Header />
      <main>
        <Hero />
        <Features />
        <Workflow />
        <TechStack />
      </main>
      <Footer />
    </div>
  );
} 