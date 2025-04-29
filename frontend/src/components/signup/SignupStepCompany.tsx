"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";

interface SignupStepCompanyProps {
  data: {
    companyName: string;
    website: string;
    companySize: string;
    industry: string;
  };
  onUpdate: (data: Partial<SignupStepCompanyProps['data']>) => void;
  onNext: () => void;
  onBack: () => void;
}

const companySizes = [
  { id: '1-5', label: '1-5' },
  { id: '6-50', label: '6-50' },
  { id: '51-500', label: '51-500' },
  { id: '500+', label: '500+' }
];

const industries = [
  { id: 'ecommerce', label: 'E-commerce', icon: '🛍️' },
  { id: 'saas', label: 'SaaS', icon: '💻' },
  { id: 'agency', label: 'Marketing Agency', icon: '🎯' },
  { id: 'fintech', label: 'Fintech', icon: '💳' },
  { id: 'education', label: 'Education', icon: '📚' },
  { id: 'other', label: 'Other', icon: '✨' }
];

export function SignupStepCompany({ data, onUpdate, onNext, onBack }: SignupStepCompanyProps) {
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
