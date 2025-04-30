"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { CheckIcon, LockIcon } from 'lucide-react';

export const plans = [
  {
    name: 'Starter',
    price: '€39',
    period: 'per month',
    features: [
      '10 videos per month',
      '300 Natural AI Actors',
      'Use 35 languages',
      '2 minutes wait time',
      'Play videos up to 120 sec',
      'AI Reactions'
    ],
    action: 'Select plan',
    actionType: 'primary'
  },
  {
    name: 'Professional',
    price: '€99',
    period: 'per month',
    popular: true,
    features: [
      '20 videos per month',
      '300 Natural AI Actors',
      'Use 35 languages',
      '2 minutes wait time',
      'Play videos up to 120 sec',
      'AI Reactions'
    ],
    action: 'Select plan',
    actionType: 'primary'
  },
  {
    name: 'Pro',
    price: 'Custom',
    features: [
      'All from Creator, plus:',
      '700+ Natural AI Actors',
      'Clone your own actors',
      'Collaborate with team',
      'Ad Performance Guidance',
      'Delivered in 2 minutes',
      'AI Reactions',
      'API access'
    ],
    action: 'Contact us',
    actionType: 'secondary'
  }
];

interface PricingPlansProps {
  title?: string;
  subtitle?: string;
}

export function PricingPlans({ 
  title = "Select plan",
  subtitle = "Unlock the power of Arcads for your company."
}: PricingPlansProps) {
  return (
    <div>
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-4xl font-bold mb-4">
          {title}
        </h1>
        <p className="text-lg text-zinc-400 max-w-xl mx-auto">
          {subtitle}
        </p>
      </motion.div>

