"use client";
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { PricingPlans } from '@/components/pricing/PricingPlans';
import { TrustSection } from '@/components/trust/TrustSection';
import { FAQSection } from '@/components/faq/FAQSection';
import { PageBackground } from "@/components/ui/PageBackground";

export default function PricingPage() {
  const searchParams = useSearchParams();
  const [workspaceId, setWorkspaceId] = useState<number | undefined>(undefined);
  
  useEffect(() => {
    // Get workspace ID from URL if available
    const workspaceParam = searchParams.get('workspace');
    if (workspaceParam && !isNaN(parseInt(workspaceParam))) {
      setWorkspaceId(parseInt(workspaceParam));
    }
  }, [searchParams]);
  
  return (
    <div className="min-h-screen bg-[#070b1a] text-white overflow-hidden">
      <PageBackground />
      
      <div className="container max-w-7xl mx-auto px-4 py-16 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-zinc-300 mb-6">
            Select the plan that best fits your team's needs
          </p>
          <p className="text-zinc-400">
            All plans include our core AI features, secure cloud storage, and regular updates.
          </p>
        </div>
        
        <PricingPlans/>
        
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
