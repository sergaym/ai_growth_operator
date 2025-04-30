"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from "@/components/ui/Logo";
import { PageBackground } from "@/components/ui/PageBackground";
import { SignupStepProfile } from "@/components/signup/SignupStepProfile";
import { SignupStepCompany } from "@/components/signup/SignupStepCompany";
import { SignupStepGoals } from "@/components/signup/SignupStepGoals";
import { SignupStepComplete } from "@/components/signup/SignupStepComplete";
import { SignupProgress } from "@/components/signup/SignupProgress";

function SignupPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Profile
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    
    // Company
    companyName: '',
    website: '',
    companySize: '',
    industry: '',
    
    // Goals & Usage
    primaryGoal: '',
    contentTypes: [] as string[],
    monthlyVideos: '',
    monthlyBudget: '',
    aiExperience: '',
  });

  // Handle email from login redirect
  useEffect(() => {
    const email = searchParams.get('email');
    const callbackUrl = searchParams.get('callbackUrl');
    
    if (email) {
      setFormData(prev => ({ ...prev, email }));
    }
    
    // Store callback URL if provided
    if (callbackUrl) {
      sessionStorage.setItem('signupCallbackUrl', callbackUrl);
    }
  }, [searchParams]);

  const updateFormData = (data: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const handleSignupComplete = async () => {
    try {
      // Here you would typically make an API call to create the user
      // For now, we'll simulate success
      
      // Get the stored callback URL or default to playground
      const callbackUrl = sessionStorage.getItem('signupCallbackUrl') || '/playground';
      sessionStorage.removeItem('signupCallbackUrl'); // Clean up
      
      // Redirect to the callback URL
      router.push(callbackUrl);
    } catch (error) {
      console.error('Signup error:', error);
      // Handle error appropriately
    }
  };

  const steps = [
    {
      title: "Tell us about yourself",
      subtitle: "We'll personalize your experience based on your role and needs"
    },
    {
      title: "Company details",
      subtitle: "Help us understand your business context"
    },
    {
      title: "Your AI content goals",
      subtitle: "We'll customize our AI to match your content strategy"
    },
    {
      title: "Almost there!",
      subtitle: "Review your information and get started"
    }
  ];

  return (
    <div className="min-h-screen bg-[#030712] text-white overflow-hidden">
      <PageBackground />
      
      <div className="container max-w-6xl mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <Logo size="md" showText={true} />
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            <h1 className="text-3xl font-bold mb-2">
              {steps[step - 1].title}
            </h1>
            <p className="text-zinc-400">
              {steps[step - 1].subtitle}
            </p>
          </motion.div>
        </div>

        {/* Progress Bar */}
        <SignupProgress currentStep={step} totalSteps={4} />
        
        {/* Form Steps */}
        <div className="max-w-2xl mx-auto mt-12">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <SignupStepProfile
                key="step1"
                data={formData}
                onUpdate={updateFormData}
                onNext={nextStep}
              />
            )}
            {step === 2 && (
              <SignupStepCompany
                key="step2"
                data={formData}
                onUpdate={updateFormData}
                onNext={nextStep}
                onBack={prevStep}
              />
            )}
            {step === 3 && (
              <SignupStepGoals
                key="step3"
                data={formData}
                onUpdate={updateFormData}
                onNext={nextStep}
                onBack={prevStep}
              />
            )}
            {step === 4 && (
              <SignupStepComplete
                key="step4"
                data={formData}
                onFinish={handleSignupComplete}
                onBack={prevStep}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#030712] flex items-center justify-center text-white">Loading...</div>}>
      <SignupPageContent />
    </Suspense>
  );
} 