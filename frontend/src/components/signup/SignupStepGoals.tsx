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
                    ? 'border-blue-500 bg-blue-500/10'
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
                    ? 'border-blue-500 bg-blue-500/10'
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

        {/* Monthly Videos */}
        <div>
          <label className="block text-sm font-medium text-white mb-4">
            How many videos do you plan to create monthly?
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {monthlyVideos.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => onUpdate({ monthlyVideos: option.id })}
                className={`p-4 rounded-xl border text-center transition-all ${
                  data.monthlyVideos === option.id
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                <span className="text-sm font-medium text-white">
                  {option.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Monthly Budget */}
        <div>
          <label className="block text-sm font-medium text-white mb-4">
            What's your monthly marketing budget?
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {monthlyBudgets.map((budget) => (
              <button
                key={budget.id}
                type="button"
                onClick={() => onUpdate({ monthlyBudget: budget.id })}
                className={`p-4 rounded-xl border text-center transition-all ${
                  data.monthlyBudget === budget.id
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                <span className="text-sm font-medium text-white">
                  {budget.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between">
          <Button
            variant="ghost"
            onClick={onBack}
            className="rounded-lg text-base font-medium flex items-center gap-2"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back
          </Button>
          <Button
            variant="gradient" 
            gradient="purple-blue" 
            className="rounded-xl text-base font-medium"
          >
            Continue
          </Button>
        </div>
      </form>
    </motion.div>
  );
} 