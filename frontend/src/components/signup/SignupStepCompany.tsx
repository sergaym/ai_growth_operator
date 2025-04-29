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
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Company name and website */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Company name
            </label>
            <input
              type="text"
              required
              value={data.companyName}
              onChange={(e) => onUpdate({ companyName: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              placeholder="Enter company name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Website
            </label>
            <input
              type="url"
              required
              value={data.website}
              onChange={(e) => onUpdate({ website: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              placeholder="https://"
            />
          </div>
        </div>

        {/* Company size */}
        <div>
          <label className="block text-sm font-medium text-white mb-4">
            Company size
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {companySizes.map((size) => (
              <button
                key={size.id}
                type="button"
                onClick={() => onUpdate({ companySize: size.id })}
                className={`p-4 rounded-xl border text-center transition-all ${
                  data.companySize === size.id
                    ? 'border-red-500 bg-red-500/10'
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                <span className="text-sm font-medium text-white">
                  {size.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Industry */}
        <div>
          <label className="block text-sm font-medium text-white mb-4">
            Industry
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {industries.map((industry) => (
              <button
                key={industry.id}
                type="button"
                onClick={() => onUpdate({ industry: industry.id })}
                className={`flex items-center p-4 rounded-xl border transition-all ${
                  data.industry === industry.id
                    ? 'border-red-500 bg-red-500/10'
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                <span className="text-2xl mr-3">{industry.icon}</span>
                <span className="text-sm font-medium text-white">
                  {industry.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between">
          <Button
            onClick={onBack}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-amber-500 hover:from-red-600 hover:to-amber-600 transition-all text-base font-medium text-white shadow-lg shadow-red-500/20 hover:shadow-red-500/30 hover:translate-y-[-2px]"
            >
            Back
          </Button>
          <Button
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-amber-500 hover:from-red-600 hover:to-amber-600 transition-all text-base font-medium text-white shadow-lg shadow-red-500/20 hover:shadow-red-500/30 hover:translate-y-[-2px]"
            >
            Continue
          </Button>
        </div>
      </form>
    </motion.div>
  );
} 