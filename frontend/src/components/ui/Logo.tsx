"use client";
import React from "react";
import { motion } from "framer-motion";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function Logo({ size = "md", showText = true }: LogoProps) {
  // Size mappings
  const sizes = {
    sm: {
      container: "p-2",
      logoSize: "w-8 h-8",
      fontSize: "text-base",
      gap: "gap-2"
    },
    md: {
      container: "p-3",
      logoSize: "w-10 h-10",
      fontSize: "text-xl",
      gap: "gap-3"
    },
    lg: {
      container: "p-4",
      logoSize: "w-12 h-12",
      fontSize: "text-2xl",
      gap: "gap-4"
    }
  };

  const currentSize = sizes[size];

  return (
    <div className={`inline-flex items-center ${currentSize.gap} ${currentSize.container} bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl`}>
      <div className={`relative ${currentSize.logoSize}`}>
        <motion.div 
          className="absolute inset-0 rounded-xl bg-gradient-to-tr from-red-500 to-amber-500"
          animate={{ 
            rotate: [0, 360],
          }}
          transition={{ 
            duration: 20, 
            repeat: Infinity,
            repeatType: "loop",
            ease: "linear"
          }}
        />
        <div className="absolute inset-[3px] bg-[#030712] rounded-lg flex items-center justify-center text-white font-bold">
          A
        </div>
      </div>
      {showText && (
        <span className={`${currentSize.fontSize} font-bold tracking-tight`}>
          AI Growth Operator
        </span>
      )}
    </div>
  );
} 