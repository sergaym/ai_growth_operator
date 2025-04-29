"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";

interface SignupStepCompanyProps {
  data: {
    companyName: string;
    website: string;
    companySize: string;
    industry: string;
  };
  onUpdate: (data: Partial<SignupStepCompanyProps['data']>) => void;
  onNext: () => void;
  onBack: () => void;
}

const companySizes = [
  { id: '1-5', label: '1-5' },
  { id: '6-50', label: '6-50' },
  { id: '51-500', label: '51-500' },
  { id: '500+', label: '500+' }
];
