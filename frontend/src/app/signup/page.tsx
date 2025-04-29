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
