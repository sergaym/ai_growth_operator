"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { CheckCircle } from 'lucide-react';

interface SignupStepCompleteProps {
  data: {
    firstName: string;
    companyName: string;
  };
  onFinish: () => void;
}
