"use client";
import React from 'react';
import { PricingPlans } from '@/components/pricing/PricingPlans';
import { TrustSection } from '@/components/trust/TrustSection';
import { FAQSection } from '@/components/faq/FAQSection';

export default function SubscriptionPage() {
  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <div className="container max-w-7xl mx-auto px-4 py-16 relative z-10">
        <PricingPlans />
        
        <div className="mt-32">
          <TrustSection />
        </div>

        <div className="mt-32">
          <FAQSection />
        </div>
      </div>
    </div>
  );
} 