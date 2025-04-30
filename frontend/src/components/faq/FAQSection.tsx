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

