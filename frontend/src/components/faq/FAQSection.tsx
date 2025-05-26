"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export interface FAQItem {
  question: string;
  answer: string;
}

const defaultFAQs: FAQItem[] = [
  {
    question: "How do subscription plans work?",
    answer: "Our subscription plans are based on the number of users in your workspace. Each plan offers a different maximum user limit, and you can upgrade at any time as your team grows. All plans include our core AI features with varying levels of usage limits."
  },
  {
    question: "Can I change my subscription plan?",
    answer: "Yes, you can upgrade, downgrade, or cancel your subscription at any time through the billing section in your workspace settings. When upgrading, the new features and limits are available immediately. When downgrading, changes will take effect at the end of your current billing cycle."
  },
  {
    question: "How is billing handled?",
    answer: "We use Stripe for secure payment processing. You'll be billed on a monthly or annual basis depending on the plan you choose. All payment information is securely stored by Stripe and not on our servers."
  },
  {
    question: "Is there a free trial available?",
    answer: "Yes, all new workspaces start with a 14-day free trial of our Professional plan. No credit card is required to start your trial, and you can upgrade to a paid plan at any time during or after your trial period."
  },
  {
    question: "What payment methods are accepted?",
    answer: "We accept all major credit cards (Visa, Mastercard, American Express) through our secure payment processor, Stripe. For enterprise plans, we can also accommodate invoicing and other payment methods - please contact our sales team."
  },
  {
    question: "What happens if I exceed my user limit?",
    answer: "If you try to add users beyond your plan's limit, you'll be prompted to upgrade to a higher tier plan. We won't automatically charge you for exceeding limits - you'll always have control over when to upgrade."
  },
  {
    question: "Can I get a refund if I'm not satisfied?",
    answer: "We offer a 30-day money-back guarantee for all new paid subscriptions. If you're not completely satisfied with our service, contact our support team within 30 days of your initial purchase for a full refund."
  },
  {
    question: "Do you offer special pricing for startups or non-profits?",
    answer: "Yes, we offer special pricing for eligible startups, non-profit organizations, and educational institutions. Please contact our sales team with verification of your status to learn more about our discount programs."
  },
  {
    question: "What happens to my data if I cancel my subscription?",
    answer: "Your workspace data remains accessible for 30 days after cancellation, during which time you can export any information you need. After 30 days, your data will be scheduled for deletion in accordance with our data retention policies."
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className="border border-white/10 rounded-xl bg-white/[0.02] px-6 data-[state=open]:pb-6"
            >
              <AccordionTrigger className="py-6 text-left hover:no-underline">
                <h3 className="text-lg font-semibold text-white">
                  {faq.question}
                </h3>
              </AccordionTrigger>
              <AccordionContent className="text-zinc-400">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </motion.div>

      {showSupport && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-20 text-center"
        >
          <h3 className="text-2xl font-bold mb-4">Have more questions?</h3>
          <p className="text-zinc-400 mb-6">We're here to help!</p>
          <Button
            variant="gradient"
            gradient="purple-blue"
            className="px-8 py-3 rounded-xl text-base font-medium"
          >
            Contact Support
          </Button>
        </motion.div>
      )}
    </div>
  );
} 