"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";

interface SignupStepProfileProps {
  data: {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  onUpdate: (data: Partial<SignupStepProfileProps['data']>) => void;
  onNext: () => void;
}

const roles = [
  { id: 'growth-manager', label: 'Growth Manager', icon: '📈' },
  { id: 'creative-strategist', label: 'Creative Strategist', icon: '🎯' },
  { id: 'marketing-manager', label: 'Marketing Manager', icon: '📊' },
  { id: 'content-creator', label: 'Content Creator', icon: '🎨' },
  { id: 'founder', label: 'Founder/CEO', icon: '👑' },
  { id: 'other', label: 'Other', icon: '✨' },
];

export function SignupStepProfile({ data, onUpdate, onNext }: SignupStepProfileProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
