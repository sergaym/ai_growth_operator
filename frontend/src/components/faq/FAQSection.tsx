"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";

export interface FAQItem {
  question: string;
  answer: string;
}

const defaultFAQs: FAQItem[] = [
  {
    question: "Can I see a demo of the product?",
    answer: "Yes! Book a demo with our team and we'll show you how Arcads can help your business grow."
  },
  {
    question: "Do unused credits roll over into the next month?",
    answer: "Yes. If you haven't reached your credit limit by the end of the billing period, any extra credits will carry over to the next one. However, if you cancel or downgrade your membership all unused credits will be lost."
  },
  {
    question: "Can I upgrade my account at any time?",
    answer: "Yes, if you're on the Starter plan, you can easily go to your Subscription settings. However, for Basic or Pro plans, you'll need to get in touch with our support team."
  }
];

interface FAQSectionProps {
  title?: string;
  subtitle?: string;
  faqs?: FAQItem[];
  showSupport?: boolean;
}

export function FAQSection({ 
  title = "Frequently Asked Questions",
  subtitle,
  faqs = defaultFAQs,
  showSupport = true
}: FAQSectionProps) {
  return (
    <div className="max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl font-bold mb-4">
          {title}
        </h2>
        {subtitle && (
          <p className="text-lg text-zinc-400">{subtitle}</p>
        )}
      </motion.div>

      <div className="space-y-6">
        {faqs.map((faq, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 rounded-xl bg-white/[0.02] border border-white/10"
          >
            <h3 className="text-lg font-semibold mb-2">{faq.question}</h3>
            <p className="text-zinc-400">{faq.answer}</p>
          </motion.div>
        ))}
      </div>

