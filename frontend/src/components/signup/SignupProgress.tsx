"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { CheckIcon } from 'lucide-react';

interface SignupProgressProps {
  currentStep: number;
  totalSteps: number;
}

export function SignupProgress({ currentStep, totalSteps }: SignupProgressProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="relative">
        {/* Background bar */}
        <div className="h-1 bg-zinc-800 rounded-full" />
        
        {/* Progress bar */}
        <motion.div
          className="absolute top-0 left-0 h-1 bg-gradient-to-r from-red-500 to-amber-500 rounded-full"
          initial={{ width: '0%' }}
          animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
        
        {/* Step markers */}
        <div className="absolute top-0 left-0 w-full flex justify-between transform -translate-y-1/2">
          {Array.from({ length: totalSteps }).map((_, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber <= currentStep;
            const isCurrent = stepNumber === currentStep;
            
            return (
              <motion.div
                key={index}
                className={`relative ${isCompleted ? 'z-20' : 'z-10'}`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <motion.div
                  className={`w-10 h-10 rounded-full flex items-center justify-center
                    ${isCompleted 
                      ? 'bg-gradient-to-r from-red-500 to-amber-500' 
                      : 'bg-zinc-800'
                    }
                    ${isCurrent 
                      ? 'ring-4 ring-red-500/20' 
                      : ''
                    }
                  `}
                  initial={false}
                  animate={{
                    scale: isCurrent ? 1.1 : 1,
                    background: isCompleted 
                      ? 'linear-gradient(to right, rgb(239, 68, 68), rgb(245, 158, 11))' 
                      : '#27272a'
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {isCompleted ? (
                    <CheckIcon className="w-5 h-5 text-white" />
                  ) : (
                    <span className={`text-sm font-semibold ${isCompleted ? 'text-white' : 'text-zinc-500'}`}>
                      {stepNumber}
                    </span>
                  )}
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
      
      {/* Step labels */}
      <div className="flex justify-between mt-8 px-1">
        {['Profile', 'Company', 'Goals'].map((label, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber <= currentStep;
          const isCurrent = stepNumber === currentStep;
          
          return (
            <div key={label} className="text-center flex-1">
              <motion.span
                className={`text-sm font-medium
                  ${isCompleted ? 'text-white' : 'text-zinc-500'}
                  ${isCurrent ? 'font-semibold' : ''}
                `}
                initial={false}
                animate={{
                  color: isCompleted ? '#ffffff' : '#71717a',
                  scale: isCurrent ? 1.05 : 1
                }}
                transition={{ duration: 0.2 }}
              >
                {label}
              </motion.span>
            </div>
          );
        })}
      </div>
    </div>
  );
} 