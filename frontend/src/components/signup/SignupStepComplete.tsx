"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { CheckCircle } from 'lucide-react';

interface SignupStepCompleteProps {
  data: {
    firstName: string;
    companyName: string;
  };
  onFinish: () => void;
}

export function SignupStepComplete({ data, onFinish }: SignupStepCompleteProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5 }}
      className="text-center space-y-8 max-w-2xl mx-auto py-8"
    >
      {/* Success Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="flex justify-center"
      >
        <div className="w-24 h-24 rounded-full bg-gradient-to-r from-red-500 to-amber-500 flex items-center justify-center">
          <CheckCircle className="w-12 h-12 text-white" />
        </div>
      </motion.div>
