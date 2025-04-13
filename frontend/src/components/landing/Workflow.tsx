"use client";
import React from "react";
import { motion } from "framer-motion";

type WorkflowStep = {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
};

const workflowSteps: WorkflowStep[] = [
  {
    number: 1,
    title: "Ideation",
    description: "Takes your initial idea or value proposition and analyzes its potential.",
    color: "from-red-500 to-amber-500",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9.5 14.5L9.5 19.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14.5 19.5L14.5 14.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 7C13.6569 7 15 5.65685 15 4C15 2.34315 13.6569 1 12 1C10.3431 1 9 2.34315 9 4C9 5.65685 10.3431 7 12 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 7L12 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9.5 14.5C8.5 14.5 7 13.5 7 12C7 10.5 9.5 9 9.5 9C9.5 9 14.5 11.5 14.5 9C14.5 7 16.6667 9 18 10C19.3333 11 19 13.5 17 14.5C15 15.5 14.5 14.5 14.5 14.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 22.5L19 22.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    number: 2,
    title: "Content Creation",
    description: "Automatically generates ad creatives including texts, images, and videos.",
    color: "from-amber-500 to-amber-600",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 7L18 10L15 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18 10H10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 2H8C6.93913 2 5.92172 2.42143 5.17157 3.17157C4.42143 3.92172 4 4.93913 4 6V18C4 19.0609 4.42143 20.0783 5.17157 20.8284C5.92172 21.5786 6.93913 22 8 22H16C17.0609 22 18.0783 21.5786 18.8284 20.8284C19.5786 20.0783 20 19.0609 20 18V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    number: 3,
    title: "Campaign Launch",
    description: "Connects to ad platforms, defines target audiences, and deploys campaigns.",
    color: "from-blue-500 to-blue-600",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    number: 4,
    title: "Continuous Optimization",
    description: "Monitors performance, creates new content, and optimizes budget allocation.",
    color: "from-red-500 to-red-600",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 8C19.6569 8 21 6.65685 21 5C21 3.34315 19.6569 2 18 2C16.3431 2 15 3.34315 15 5C15 6.65685 16.3431 8 18 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6 15C7.65685 15 9 13.6569 9 12C9 10.3431 7.65685 9 6 9C4.34315 9 3 10.3431 3 12C3 13.6569 4.34315 15 6 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18 22C19.6569 22 21 20.6569 21 19C21 17.3431 19.6569 16 18 16C16.3431 16 15 17.3431 15 19C15 20.6569 16.3431 22 18 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8.59 13.51L15.42 17.49" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M15.41 6.51L8.59 10.49" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export function Workflow() {
  return (
    <section id="workflow" className="py-32 bg-[#030712] text-white relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#f33_5%,transparent_50%)] opacity-[0.07]"></div>
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-repeat opacity-[0.015]"></div>
      </div>
      
      <div className="container max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-20"
        >
          <div className="inline-block py-1 px-3 mb-3 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium">
            Step-by-Step Process
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
            How It Works
          </h2>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            Our AI Growth Operator follows a streamlined workflow to take your idea from concept to successful campaign
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto space-y-16 lg:space-y-24">
          {workflowSteps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.5 }}
              className="relative"
            >
              {/* Connecting line between steps */}
              {index < workflowSteps.length - 1 && (
                <div className="absolute left-[60px] top-[100px] bottom-[-110px] w-0.5 bg-gradient-to-b from-white/20 via-white/10 to-transparent hidden md:block"></div>
              )}
              
              <div className="flex flex-col md:flex-row items-start gap-8 md:gap-12">
                {/* Step number and icon combo */}
                <div className="relative flex-shrink-0 z-20">
                  <div className="w-32 h-32 rounded-2xl bg-white/[0.07] backdrop-blur-sm border border-white/10 shadow-xl flex items-center justify-center relative overflow-hidden">
                    {/* Background grid pattern like Revolut cards */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:8px_8px]"></div>
                    
                    {/* Step number */}
                    <div className="relative flex flex-col items-center">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-1`}>
                        <span className="text-2xl font-bold">{step.number}</span>
                      </div>
                      <div className="text-xs text-white/60 uppercase tracking-wider font-medium">Step {step.number}</div>
                    </div>
                    
                    {/* Decorative elements */}
                    <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-white/5"></div>
                    <div className="absolute bottom-2 left-2 w-3 h-3 rounded-full bg-white/5"></div>
                  </div>
                </div>
                
                {/* Step content */}
                <div className="md:py-4 flex-1">
                  <div className="flex items-center mb-4">
                    <div className={`mr-4 p-2 rounded-lg bg-gradient-to-br ${step.color} text-white`}>
                      {step.icon}
                    </div>
                    <h3 className="text-2xl font-bold tracking-tight">{step.title}</h3>
                  </div>
                  <p className="text-zinc-400 text-lg">{step.description}</p>
                  
                  {/* Additional information cards - for desktop only */}
                  <div className="hidden lg:block mt-6">
                    <div className="relative">
                      <div className="absolute -inset-1 bg-gradient-to-r from-white/5 to-white/0 rounded-2xl blur-sm"></div>
                      <div className="relative bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-xl p-4">
                        <div className="flex gap-2 items-center mb-1">
                          <div className="w-4 h-4 rounded-full bg-gradient-to-br from-amber-400 to-red-500"></div>
                          <span className="text-sm font-medium text-white/80">Pro Tip</span>
                        </div>
                        <p className="text-sm text-zinc-500">
                          {index === 0 && "Be specific about your target audience and value proposition for better results."}
                          {index === 1 && "Let AI generate multiple creative variations to test different messaging approaches."}
                          {index === 2 && "Start with smaller budgets to test performance before scaling up campaigns."}
                          {index === 3 && "Set clear KPIs and let the AI optimize toward your most important metrics."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Call to action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-center mt-24"
        >
          <div className="inline-block max-w-3xl mx-auto px-8 py-6 bg-gradient-to-r from-red-500/10 via-amber-500/10 to-red-500/10 backdrop-blur-sm border border-white/10 rounded-2xl relative overflow-hidden">
            {/* Background grid pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:20px_20px]"></div>
            
            <h3 className="text-2xl font-bold mb-4 relative">
              Ready to automate your marketing?
            </h3>
            <p className="text-zinc-400 mb-6 relative">
              Experience the power of AI-driven growth with our intelligent marketing agent
            </p>
            <button className="px-8 py-4 rounded-xl bg-gradient-to-r from-red-500 to-amber-500 hover:from-red-600 hover:to-amber-600 text-white font-medium transition-all text-lg shadow-lg shadow-red-500/20 hover:shadow-red-500/30 hover:translate-y-[-2px]">
              Start Your First Campaign
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
} 