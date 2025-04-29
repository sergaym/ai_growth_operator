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
