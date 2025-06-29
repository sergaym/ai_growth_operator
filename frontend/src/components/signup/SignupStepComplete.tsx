"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SignupStepCompleteProps {
  data: {
    firstName: string;
    companyName: string;
  };
  onFinish: () => void;
  onBack: () => void;
}

export function SignupStepComplete({ data, onFinish, onBack }: SignupStepCompleteProps) {
  const router = useRouter();

  const handleContinue = () => {
    onFinish();
    router.push('/pricing?from=signup');
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5 }}
      className="text-center space-y-8 max-w-2xl mx-auto py-8"
    >
      {/* Success Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="flex justify-center"
      >
        <div className="w-24 h-24 rounded-full bg-gradient-to-r from-red-500 to-amber-500 flex items-center justify-center">
          <CheckCircle className="w-12 h-12 text-white" />
        </div>
      </motion.div>

      {/* Welcome Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-4"
      >
        <h2 className="text-3xl font-bold text-white">
          Welcome aboard, {data.firstName}!
        </h2>
        <p className="text-lg text-white/80">
          {data.companyName} is now ready to start creating amazing AI-generated content
        </p>
      </motion.div>

      {/* Next Steps Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white/5 rounded-2xl p-8 space-y-6 backdrop-blur-sm border border-white/10"
      >
        <h3 className="text-xl font-semibold text-white">Your next steps:</h3>
        <div className="grid gap-4 text-left">
          {[
            {
              title: "Choose Your Plan",
              description: "Select the perfect plan that matches your content creation needs."
            },
            {
              title: "Create Your First Avatar",
              description: "Start by creating your first AI avatar to represent your brand."
            },
            {
              title: "Launch Your First Campaign",
              description: "Use our templates to create your first AI-powered video campaign."
            }
          ].map((step, index) => (
            <div
              key={index}
              className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-amber-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-medium">{index + 1}</span>
              </div>
              <div>
                <h4 className="font-medium text-white">{step.title}</h4>
                <p className="text-sm text-white/70">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Action Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Button
          onClick={handleContinue}
          className="px-8 py-3 rounded-xl bg-gradient-to-r from-red-500 to-amber-500 text-white font-medium hover:from-red-600 hover:to-amber-600 transition-all shadow-lg shadow-red-500/20 hover:shadow-red-500/30 hover:translate-y-[-2px] text-lg"
        >
          Choose your plan
        </Button>
      </motion.div>
    </motion.div>
  );
} 