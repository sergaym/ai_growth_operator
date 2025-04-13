"use client";
import React from "react";
import { motion } from "framer-motion";

type Feature = {
  title: string;
  description: string;
  icon: React.ReactNode;
};

const features: Feature[] = [
  {
    title: "End-to-End Automation",
    description: "From concept to optimization, our AI handles the entire marketing workflow with minimal human intervention.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22 12C22 17.5228 17.5228 22 12 22M22 12C22 6.47715 17.5228 2 12 2M22 12H19M12 22C6.47715 22 2 17.5228 2 12M12 22V19M2 12C2 6.47715 6.47715 2 12 2M2 12H5M12 2V5M18 12C18 15.3137 15.3137 18 12 18C8.68629 18 6 15.3137 6 12C6 8.68629 8.68629 6 12 6C15.3137 6 18 8.68629 18 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    title: "Multi-Platform Integration",
    description: "Seamlessly connect with all major advertising platforms including Meta, Google, TikTok, and more.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8.56 3.69001L2.5 10.73C1.92 11.42 1.92 12.58 2.5 13.27L8.56 20.31C9.23 21.1 10.47 21.1 11.14 20.31L13.03 18.03C13.55 17.4 13.55 16.43 13.03 15.8L11.98 14.47C11.7 14.13 11.7 13.66 11.98 13.32L13.66 11.26C14.17 10.63 14.17 9.66001 13.66 9.03001L11.14 5.98001C10.47 5.19001 9.23 5.19001 8.56 5.98001V3.69001Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M15.73 9.29001L17.03 7.73001C17.71 6.92001 18.95 6.92001 19.63 7.73001L21.5 10.07C22.33 11.08 22.33 12.58 21.5 13.59L19.63 15.93C18.95 16.74 17.71 16.74 17.03 15.93L15.73 14.37C15.44 14.03 15.44 13.53 15.73 13.19L16.63 12.13C16.91 11.79 16.91 11.29 16.63 10.95L15.73 9.89001C15.44 9.55001 15.44 9.05001 15.73 8.71001V9.29001Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    title: "Adaptive Learning",
    description: "Our AI constantly improves strategies based on campaign performance data and audience engagement.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 11.5L9 16.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M5 14.5L5 16.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M17 7.5L17 16.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M13 5.5V16.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M22 16.5H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M20 20.5H4C2.895 20.5 2 19.605 2 18.5V5.5C2 4.395 2.895 3.5 4 3.5H20C21.105 3.5 22 4.395 22 5.5V18.5C22 19.605 21.105 20.5 20 20.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    title: "Dynamic Content Generation",
    description: "Automatically generate fresh ad creatives, including text, images, and videos, when engagement declines.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M17 6.5H19C20.1046 6.5 21 7.39543 21 8.5V17.5C21 18.6046 20.1046 19.5 19 19.5H5C3.89543 19.5 3 18.6046 3 17.5V8.5C3 7.39543 3.89543 6.5 5 6.5H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 15.5L12 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M8.5 7L12 3.5L15.5 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    title: "AI Video Generation",
    description: "Create professional-quality videos from text prompts using cutting-edge Luma AI technology.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 10L19.5528 7.72361C20.2177 7.39116 21 7.87465 21 8.61803V15.382C21 16.1253 20.2177 16.6088 19.5528 16.2764L15 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M5 18H13C14.1046 18 15 17.1046 15 16V8C15 6.89543 14.1046 6 13 6H5C3.89543 6 3 6.89543 3 8V16C3 17.1046 3.89543 18 5 18Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    title: "Budget Optimization",
    description: "Automatically adjust spending across platforms and campaigns to maximize ROI based on real-time performance.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 7.5H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M18 3.5H6C3.79086 3.5 2 5.29086 2 7.5V16.5C2 18.7091 3.79086 20.5 6 20.5H18C20.2091 20.5 22 18.7091 22 16.5V7.5C22 5.29086 20.2091 3.5 18 3.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 16.5C13.933 16.5 15.5 14.933 15.5 13C15.5 11.067 13.933 9.5 12 9.5C10.067 9.5 8.5 11.067 8.5 13C8.5 14.933 10.067 16.5 12 16.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
];

