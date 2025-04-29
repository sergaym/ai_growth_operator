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
