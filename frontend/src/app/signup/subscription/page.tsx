"use client";
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { PricingPlans } from '@/components/pricing/PricingPlans';
import { TrustSection } from '@/components/trust/TrustSection';
import { FAQSection } from '@/components/faq/FAQSection';
import { CheckCircle } from 'lucide-react';
import { PageBackground } from "@/components/ui/PageBackground";

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
    <div className="min-h-screen bg-[#070b1a] text-white overflow-hidden">
      <PageBackground />
      
      <div className="container max-w-7xl mx-auto px-4 py-16 relative z-10">
        {/* Welcome header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="flex justify-center mb-8"
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            Welcome aboard, {userData.firstName}!
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl text-zinc-300 mb-6"
          >
            You're ready to start creating amazing AI-generated content
          </motion.p>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-zinc-400"
          >
            Choose the perfect plan that matches your content creation needs.
          </motion.p>
        </div>
        
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