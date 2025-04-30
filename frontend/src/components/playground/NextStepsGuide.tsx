"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle2, ChevronRight } from 'lucide-react';

interface Step {
  id: number;
  title: string;
  description: string;
  completed?: boolean;
  href?: string;
}

const steps: Step[] = [
  {
    id: 1,
    title: "Choose Your Plan",
    description: "Select the perfect plan that matches your content creation needs.",
    href: "/signup/subscription"
  },
  {
    id: 2,
    title: "Create Your First Avatar",
    description: "Start by creating your first AI avatar to represent your brand."
  },
  {
    id: 3,
    title: "Launch Your First Campaign",
    description: "Use our templates to create your first AI-powered video campaign."
  }
];

