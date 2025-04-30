"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle2, ChevronRight } from 'lucide-react';

interface Step {
  id: number;
  title: string;
  description: string;
  completed?: boolean;
  href?: string;
}

const steps: Step[] = [
  {
    id: 1,
    title: "Choose Your Plan",
    description: "Select the perfect subscription that matches your needs.",
    href: "/signup/subscription",
    completed: true
  },
  {
    id: 2,
    title: "Complete Your Account",
    description: "Add your profile information and preferences.",
    href: "/account/setup",
    completed: false
  },
  {
    id: 3,
    title: "Create Your First Video",
    description: "Start creating amazing AI-powered content.",
    href: "/studio/create",
    completed: false
  }
];

export function NextStepsGuide() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="fixed bottom-6 right-6 bg-[#1C1C1C] text-white rounded-xl shadow-2xl w-80 overflow-hidden"
    >
      <div className="p-4 border-b border-white/10">
        <h3 className="text-lg font-semibold">Almost there, let's get started! 🚀</h3>
      </div>
      
      <div className="p-2">
        {steps.map((step) => (
          <Link
            key={step.id}
            href={step.href || '#'}
            className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
              step.href ? 'hover:bg-white/5 cursor-pointer' : 'cursor-default'
            }`}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
              step.completed ? 'bg-green-500' : 'bg-orange-500'
            }`}>
              {step.completed ? (
                <CheckCircle2 className="w-4 h-4 text-white" />
              ) : (
                <span className="text-sm font-medium text-white">{step.id}</span>
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-white">{step.title}</h4>
                {step.href && (
                  <ChevronRight className="w-4 h-4 text-white/50" />
                )}
              </div>
              <p className="text-sm text-white/70 mt-0.5">{step.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </motion.div>
  );
} 