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
    href: "/pricing?from=signup",
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
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Almost there! ✌️</h3>
          <span className="text-sm text-white/70">
            {steps.filter(step => step.completed).length}/{steps.length}
          </span>
        </div>
      </div>
      
      <div className="p-2">
        {steps.map((step, index) => (
          <Link
            key={step.id}
            href={step.href || '#'}
            className={`group flex items-start gap-3 p-3 rounded-lg transition-colors ${
              step.href ? 'hover:bg-white/5 cursor-pointer' : 'cursor-default'
            }`}
          >
            <div className={`relative w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
              step.completed ? 'bg-green-500' : 
              index > 0 && !steps[index - 1].completed ? 'bg-gray-600' : 'bg-orange-500'
            }`}>
              {step.completed ? (
                <CheckCircle2 className="w-4 h-4 text-white" />
              ) : (
                <span className="text-sm font-medium text-white">{step.id}</span>
              )}
              {index < steps.length - 1 && (
                <div className={`absolute h-8 w-0.5 top-6 left-1/2 transform -translate-x-1/2 ${
                  step.completed ? 'bg-green-500' : 'bg-gray-600'
                }`} />
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className={`font-medium ${
                  step.completed ? 'line-through text-white/50' : 'text-white'
                }`}>
                  {step.title}
                </h4>
                {step.href && !step.completed && (
                  <ChevronRight className="w-4 h-4 text-white/50 group-hover:text-white/70 transition-colors" />
                )}
              </div>
              <p className={`text-sm mt-0.5 ${
                step.completed ? 'text-white/40' : 'text-white/70'
              }`}>
                {step.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </motion.div>
  );
} 