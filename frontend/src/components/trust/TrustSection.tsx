"use client";
import React from 'react';
import { motion } from 'framer-motion';

interface TrustSectionProps {
  title?: string;
  videoCount?: number;
}

export function TrustSection({ 
  title = "Already 5000 winnings ads made with HumanAds",
  videoCount = 6
}: TrustSectionProps) {
  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl font-bold mb-4">
          {title}
        </h2>
      </motion.div>

      {/* Video Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Array.from({ length: videoCount }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="aspect-[9/16] rounded-xl bg-white/5 overflow-hidden"
          >
            {/* This would be replaced with actual video thumbnails */}
            <div className="w-full h-full bg-gradient-to-br from-red-500/10 to-amber-500/10" />
          </motion.div>
        ))}
      </div>
    </div>
  );
} 