"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from "@/components/ui/Logo";
import { PageBackground } from "@/components/ui/PageBackground";
import { SignupStepProfile } from "@/components/signup/SignupStepProfile";
import { SignupStepCompany } from "@/components/signup/SignupStepCompany";
import { SignupStepGoals } from "@/components/signup/SignupStepGoals";
import { SignupStepComplete } from "@/components/signup/SignupStepComplete";
import { SignupProgress } from "@/components/signup/SignupProgress";

export default function SignupPage() {
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
    contentTypes: [],
    monthlyVideos: '',
    monthlyBudget: '',
    aiExperience: '',
  });

  const updateFormData = (data: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

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
