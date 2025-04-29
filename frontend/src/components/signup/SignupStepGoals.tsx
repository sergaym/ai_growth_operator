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

