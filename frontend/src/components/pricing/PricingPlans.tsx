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

