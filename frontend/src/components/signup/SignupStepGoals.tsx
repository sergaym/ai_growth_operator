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
                    ? 'border-red-500 bg-red-500/10'
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
                    ? 'border-red-500 bg-red-500/10'
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
            type="button"
            onClick={onBack}
            className="px-6 py-3 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5 transition-all"
          >
            Back
          </Button>
          <Button
            type="submit"
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-red-500 to-amber-500 text-white font-medium hover:from-red-600 hover:to-amber-600 transition-all shadow-lg shadow-red-500/20 hover:shadow-red-500/30 hover:translate-y-[-2px]"
          >
            Continue
          </Button>
        </div>
      </form>
    </motion.div>
  );
} 