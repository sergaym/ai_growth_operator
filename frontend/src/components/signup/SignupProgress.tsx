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
