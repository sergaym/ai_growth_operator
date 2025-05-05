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
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
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
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
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
                    ? 'border-blue-500 bg-blue-500/10'
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
                    ? 'border-blue-500 bg-blue-500/10'
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