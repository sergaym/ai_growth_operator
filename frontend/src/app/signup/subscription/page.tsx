"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { CheckIcon, LockIcon } from 'lucide-react';

const plans = [
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

export default function SubscriptionPage() {
  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <div className="container max-w-7xl mx-auto px-4 py-16 relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl font-bold mb-4">
            Select plan
          </h1>
          <p className="text-lg text-zinc-400 max-w-xl mx-auto">
            Unlock the power of Arcads for your company.
          </p>
        </motion.div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative bg-white/[0.02] backdrop-blur-sm rounded-2xl border ${
                plan.popular ? 'border-red-500' : 'border-white/10'
              } p-8 flex flex-col`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-zinc-800 text-white text-xs font-medium px-3 py-1 rounded-full">
                    POPULAR
                  </span>
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">{plan.name}</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && (
                    <span className="text-zinc-400">{plan.period}</span>
                  )}
                </div>
              </div>

              <ul className="space-y-4 mb-8 flex-grow">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <span className="text-zinc-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full py-3 rounded-xl transition-all text-base font-medium
                  ${plan.actionType === 'primary'
                    ? 'bg-gradient-to-r from-red-500 to-amber-500 hover:from-red-600 hover:to-amber-600 text-white shadow-lg shadow-red-500/20 hover:shadow-red-500/30 hover:translate-y-[-2px]'
                    : 'bg-zinc-800 text-white hover:bg-zinc-700'
                  }
                `}
              >
                {plan.actionType === 'secondary' && (
                  <LockIcon className="w-4 h-4 mr-2 inline-block" />
                )}
                {plan.action}
              </Button>
            </motion.div>
          ))}
        </div>

