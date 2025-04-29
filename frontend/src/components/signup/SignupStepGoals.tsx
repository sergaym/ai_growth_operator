"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";

interface SignupStepGoalsProps {
  data: {
    primaryGoal: string;
    contentTypes: string[];
    monthlyVideos: string;
    monthlyBudget: string;
    aiExperience: string;
  };
  onUpdate: (data: Partial<SignupStepGoalsProps['data']>) => void;
  onNext: () => void;
  onBack: () => void;
}
