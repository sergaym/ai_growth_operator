"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";

interface SignupStepGoalsProps {
  data: {
    primaryGoal: string;
    contentTypes: string[];
    monthlyVideos: string;
    monthlyBudget: string;
    aiExperience: string;
  };
  onUpdate: (data: Partial<SignupStepGoalsProps['data']>) => void;
  onNext: () => void;
  onBack: () => void;
}

const goals = [
  { id: 'brand-awareness', label: 'Brand Awareness', icon: '🎯' },
  { id: 'lead-generation', label: 'Lead Generation', icon: '🌱' },
  { id: 'sales', label: 'Sales & Conversion', icon: '💰' },
  { id: 'engagement', label: 'Community Engagement', icon: '🤝' },
  { id: 'education', label: 'Product Education', icon: '📚' },
  { id: 'other', label: 'Other', icon: '✨' }
];

const contentTypes = [
  { id: 'product-demos', label: 'Product Demos', icon: '🎮' },
  { id: 'testimonials', label: 'Testimonials', icon: '🗣️' },
  { id: 'educational', label: 'Educational Content', icon: '📚' },
  { id: 'ads', label: 'Social Ads', icon: '📢' },
  { id: 'explainers', label: 'Explainer Videos', icon: '🎬' },
  { id: 'social', label: 'Social Media Content', icon: '📱' }
];

const monthlyVideos = [
  { id: '0-20', label: '0-20' },
  { id: '21-50', label: '21-50' },
  { id: '51-500', label: '51-500' },
  { id: '500+', label: '500+' }
];

const monthlyBudgets = [
  { id: '0-99', label: '0 - $99K' },
  { id: '100-1m', label: '$100K - $1M' },
  { id: '1m-5m', label: '$1M - $5M' },
  { id: '5m+', label: '$5M+' }
];

export function SignupStepGoals({ data, onUpdate, onNext, onBack }: SignupStepGoalsProps) {
  const toggleContentType = (type: string) => {
    const current = data.contentTypes || [];
    const updated = current.includes(type)
      ? current.filter(t => t !== type)
      : [...current, type];
    onUpdate({ contentTypes: updated });
  };

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
        {/* Primary Goal */}
        <div>
          <label className="block text-sm font-medium text-white mb-4">
            What's your primary goal with AI-generated content?
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {goals.map((goal) => (
              <button
                key={goal.id}
                type="button"
                onClick={() => onUpdate({ primaryGoal: goal.id })}
                className={`flex items-center p-4 rounded-xl border transition-all ${
                  data.primaryGoal === goal.id
                    ? 'border-red-500 bg-red-500/10'
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                <span className="text-2xl mr-3">{goal.icon}</span>
                <span className="text-sm font-medium text-white">
                  {goal.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Types */}
        <div>
          <label className="block text-sm font-medium text-white mb-4">
            What type of content do you plan to create? (Select all that apply)
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contentTypes.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => toggleContentType(type.id)}
                className={`flex items-center p-4 rounded-xl border transition-all ${
                  data.contentTypes?.includes(type.id)
                    ? 'border-red-500 bg-red-500/10'
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                <span className="text-2xl mr-3">{type.icon}</span>
                <span className="text-sm font-medium text-white">
                  {type.label}
                </span>
              </button>
            ))}
          </div>
        </div>

