"use client";
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { PricingPlans } from '@/components/pricing/PricingPlans';
import { TrustSection } from '@/components/trust/TrustSection';
import { FAQSection } from '@/components/faq/FAQSection';
import { CheckCircle } from 'lucide-react';

export default function SubscriptionPage() {
  const [userData, setUserData] = useState({
    firstName: '',
    companyName: ''
  });
  
  // Try to retrieve user data when component mounts
  useEffect(() => {
    // This would normally come from your auth/user context or API
    // For demo purposes, we're using sessionStorage
    const storedData = sessionStorage.getItem('signupData');
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setUserData({
          firstName: parsedData.firstName || 'there',
          companyName: parsedData.companyName || 'Your company'
        });
      } catch (e) {
        console.error('Error parsing user data', e);
      }
    }
  }, []);

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