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
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Name fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              First name
            </label>
            <input
              type="text"
              required
              value={data.firstName}
              onChange={(e) => onUpdate({ firstName: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              placeholder="Enter your first name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Last name
            </label>
            <input
              type="text"
              required
              value={data.lastName}
              onChange={(e) => onUpdate({ lastName: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              placeholder="Enter your last name"
            />
          </div>
        </div>

        {/* Email field */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Work email
          </label>
          <input
            type="email"
            required
            value={data.email}
            onChange={(e) => onUpdate({ email: e.target.value })}
            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            placeholder="name@company.com"
          />
        </div>

