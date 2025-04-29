"use client";
import React from 'react';
import { motion } from 'framer-motion';

interface SignupProgressProps {
  currentStep: number;
  totalSteps: number;
}

export function SignupProgress({ currentStep, totalSteps }: SignupProgressProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="relative">
        {/* Background bar */}
        <div className="h-2 bg-white/10 rounded-full" />
        
        {/* Progress bar */}
        <motion.div
          className="absolute top-0 left-0 h-2 bg-gradient-to-r from-red-500 to-amber-500 rounded-full"
          initial={{ width: '0%' }}
          animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
        
        {/* Step markers */}
        <div className="absolute top-0 left-0 w-full flex justify-between transform -translate-y-1/2">
          {Array.from({ length: totalSteps }).map((_, index) => {
            const isCompleted = index + 1 <= currentStep;
            const isCurrent = index + 1 === currentStep;
            
            return (
              <motion.div
                key={index}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${isCompleted ? 'bg-gradient-to-r from-red-500 to-amber-500' : 'bg-white/10'}
                  ${isCurrent ? 'ring-4 ring-red-500/20' : ''}
                `}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                {isCompleted ? (
                  <svg className="w-4 h-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span className={`${isCompleted ? 'text-white' : 'text-white/60'}`}>
                    {index + 1}
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
