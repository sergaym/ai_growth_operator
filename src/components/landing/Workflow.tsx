"use client";
import React from "react";
import { motion } from "framer-motion";

type WorkflowStep = {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
};

const workflowSteps: WorkflowStep[] = [
  {
    number: 1,
    title: "Ideation",
    description: "Takes your initial idea or value proposition and analyzes its potential.",
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
    <section id="workflow" className="py-24 bg-gradient-to-b from-black to-blue-950 text-white relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,#4f46e5,transparent_50%)]"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,#7e22ce,transparent_50%)]"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 inline-block bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            How It Works
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Our AI Growth Operator follows a streamlined workflow to take your idea from concept to successful campaign.
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          {workflowSteps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.5 }}
              className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-16 relative"
            >
              {/* Connecting line between steps */}
              {index < workflowSteps.length - 1 && (
                <div className="absolute left-[39px] top-[70px] bottom-[-70px] w-0.5 bg-gradient-to-b from-blue-500 to-purple-500 hidden md:block"></div>
              )}
              
              {/* Step number */}
              <div className="flex-shrink-0 rounded-full w-20 h-20 flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg shadow-blue-500/20 z-10">
                <span className="text-2xl font-bold">{step.number}</span>
              </div>
              
              {/* Step content */}
              <div className="md:ml-6 flex-1">
                <div className="flex items-center mb-2">
                  <div className="mr-3 text-blue-400">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-bold">{step.title}</h3>
                </div>
                <p className="text-gray-300">{step.description}</p>
              </div>
              
              {/* Decorative gradient sphere */}
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute hidden lg:block right-0 w-40 h-40 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 blur-xl"
                style={{ right: `-${index * 20}px`, top: `${index * 10}px` }}
              />
            </motion.div>
          ))}
        </div>
        
        {/* Call to action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="text-center mt-16"
        >
          <div className="inline-block py-1 px-3 mb-4 text-sm font-medium rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300">
            Ready to get started?
          </div>
          <h3 className="text-2xl font-bold mb-6">
            Experience the power of AI-driven growth today
          </h3>
          <button className="px-8 py-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium transition-all shadow-lg shadow-blue-600/20">
            Start Your First Campaign
          </button>
        </motion.div>
      </div>
    </section>
  );
} 