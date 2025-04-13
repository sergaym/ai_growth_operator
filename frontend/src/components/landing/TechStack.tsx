"use client";
import React from "react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

type TechItem = {
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
};

const techStack: TechItem[] = [
  {
    name: "Python",
    description: "Core backend language used for AI processing, data handling, and system automation.",
    color: "bg-blue-500",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
        <path d="M12 0C5.9 0 6.2 2.7 6.2 2.7V5.5H12.1V6.1H3.9C3.9 6.1 0 5.7 0 12C0 18.3 3.4 18 3.4 18H5.4V15C5.4 15 5.3 11.6 8.9 11.6H14.9C14.9 11.6 18 11.7 18 8.8V3.6C18 3.6 18.5 0 12 0ZM8.8 1.9C9.3 1.9 9.7 2.3 9.7 2.8C9.7 3.3 9.3 3.7 8.8 3.7C8.3 3.7 7.9 3.3 7.9 2.8C7.9 2.3 8.3 1.9 8.8 1.9ZM24 11.9C24 5.6 20.6 5.9 20.6 5.9H18.6V9C18.6 9 18.7 12.4 15.1 12.4H9.1C9.1 12.4 6 12.3 6 15.2V20.4C6 20.4 5.5 24 12 24C18.1 24 17.8 21.3 17.8 21.3V18.5H12V17.9H20.1C20.1 17.9 24 18.3 24 11.9ZM15.2 22.1C14.7 22.1 14.3 21.7 14.3 21.2C14.3 20.7 14.7 20.3 15.2 20.3C15.7 20.3 16.1 20.7 16.1 21.2C16.1 21.7 15.7 22.1 15.2 22.1Z" fill="#3776AB"/>
      </svg>
    ),
  },
  {
    name: "Luma AI",
    description: "Advanced AI video generation platform that creates high-quality videos from text prompts.",
    color: "bg-gray-800",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
        <rect width="24" height="24" rx="12" fill="#000000"/>
        <path d="M17.5 7H6.5C6.10218 7 5.72064 7.15804 5.43934 7.43934C5.15804 7.72064 5 8.10218 5 8.5V15.5C5 15.8978 5.15804 16.2794 5.43934 16.5607C5.72064 16.842 6.10218 17 6.5 17H17.5C17.8978 17 18.2794 16.842 18.5607 16.5607C18.842 16.2794 19 15.8978 19 15.5V8.5C19 8.10218 18.842 7.72064 18.5607 7.43934C18.2794 7.15804 17.8978 7 17.5 7Z" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 12L11 14L15 10" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    name: "Next.js",
    description: "React framework for building server-side rendered and static web applications.",
    color: "bg-black",
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
        <mask id="mask0_408_139" style={{ maskType: 'alpha' }} maskUnits="userSpaceOnUse" x="0" y="0" width="180" height="180">
          <circle cx="90" cy="90" r="90" fill="black" />
        </mask>
        <g mask="url(#mask0_408_139)">
          <circle cx="90" cy="90" r="90" fill="black" />
          <path d="M149.508 157.52L69.142 54H54V125.97H66.1136V69.3836L139.999 164.845C143.333 162.614 146.509 160.165 149.508 157.52Z" fill="url(#paint0_linear_408_139)" />
          <rect x="115" y="54" width="12" height="72" fill="url(#paint1_linear_408_139)" />
        </g>
        <defs>
          <linearGradient id="paint0_linear_408_139" x1="109" y1="116.5" x2="144.5" y2="160.5" gradientUnits="userSpaceOnUse">
            <stop stopColor="white" />
            <stop offset="1" stopColor="white" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="paint1_linear_408_139" x1="121" y1="54" x2="120.799" y2="106.875" gradientUnits="userSpaceOnUse">
            <stop stopColor="white" />
            <stop offset="1" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    ),
  },
  {
    name: "TypeScript",
    description: "Strongly typed programming language that builds on JavaScript for safer code.",
    color: "bg-blue-600",
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" fill="#3178C6"/>
        <path d="M13.8633 17.6966V20.298C14.3467 20.5316 14.9021 20.7084 15.5294 20.8283C16.1568 20.9483 16.7479 21.0083 17.3026 21.0083C17.8425 21.0083 18.353 20.9557 18.834 20.8506C19.3151 20.7454 19.7468 20.583 20.1293 20.3631C20.5117 20.1432 20.8128 19.865 21.0325 19.5284C21.2523 19.1918 21.3621 18.792 21.3621 18.329C21.3621 18.0071 21.3138 17.7186 21.2171 17.4634C21.1205 17.2082 20.9709 16.9744 20.7685 16.7618C20.5661 16.5492 20.3128 16.3524 20.0087 16.1713C19.7045 15.9902 19.3467 15.8166 18.9352 15.6504C18.6165 15.5155 18.3426 15.3881 18.1138 15.2681C17.885 15.1481 17.6941 15.0318 17.5412 14.919C17.3884 14.8062 17.2723 14.693 17.1933 14.5796C17.1143 14.4661 17.0747 14.346 17.0747 14.2193C17.0747 14.1002 17.11 13.9902 17.1806 13.8892C17.2512 13.7882 17.3539 13.7023 17.4888 13.6313C17.6236 13.5603 17.79 13.5044 17.9878 13.4634C18.1857 13.4224 18.4169 13.402 18.6815 13.402C18.8937 13.402 19.1185 13.4196 19.3561 13.455C19.5936 13.4902 19.8317 13.5427 20.0704 13.6126C20.309 13.6824 20.5429 13.7708 20.7722 13.8779C21.0015 13.985 21.2087 14.1028 21.3938 14.2312V11.8192C20.9529 11.6252 20.4981 11.4854 20.0293 11.3999C19.5606 11.3144 19.0347 11.2716 18.4518 11.2716C17.9177 11.2716 17.4073 11.3273 16.9204 11.4387C16.4334 11.5501 16.0061 11.7201 15.6383 11.9487C15.2706 12.1773 14.979 12.4631 14.7637 12.8062C14.5484 13.1493 14.4407 13.5554 14.4407 14.0245C14.4407 14.5268 14.5317 14.9557 14.7136 15.3113C14.8956 15.6669 15.1448 15.9776 15.4613 16.2434C15.7778 16.5093 16.1457 16.7439 16.5648 16.9473C16.984 17.1507 17.4317 17.3369 17.9082 17.5059C18.2176 17.6296 18.4883 17.7533 18.7204 17.8769C18.9524 18.0006 19.1467 18.1293 19.3032 18.2633C19.4597 18.3973 19.5776 18.5377 19.6568 18.6844C19.736 18.8312 19.7756 18.9867 19.7756 19.1511C19.7756 19.2702 19.7379 19.3819 19.6626 19.4861C19.5872 19.5903 19.4736 19.6819 19.3215 19.7608C19.1694 19.8398 18.9747 19.9024 18.7372 19.9486C18.4996 19.9948 18.2199 20.0179 17.8979 20.0179C17.2212 20.0179 16.5549 19.913 15.8988 19.7031C15.2428 19.4931 14.5786 19.1753 13.9061 18.7497L13.8633 17.6966ZM11.9976 12.1018H8.86328V21.8184H11.9976V12.1018Z" fill="white"/>
        <path d="M10.4339 10.1169C10.8428 10.1169 11.2089 10.0225 11.5324 9.83384C11.8559 9.64514 12.1176 9.38918 12.3176 9.06596C12.5176 8.74274 12.6176 8.38359 12.6176 7.98851C12.6176 7.59343 12.5176 7.23428 12.3176 6.91107C12.1176 6.58785 11.8559 6.33189 11.5324 6.14319C11.2089 5.95449 10.8428 5.86014 10.4339 5.86014C10.025 5.86014 9.65895 5.95449 9.33545 6.14319C9.01194 6.33189 8.7502 6.58785 8.55022 6.91107C8.35024 7.23428 8.25024 7.59343 8.25024 7.98851C8.25024 8.38359 8.35024 8.74274 8.55022 9.06596C8.7502 9.38918 9.01194 9.64514 9.33545 9.83384C9.65895 10.0225 10.025 10.1169 10.4339 10.1169Z" fill="white"/>
      </svg>
    ),
  },
  {
    name: "TailwindCSS",
    description: "Utility-first CSS framework for rapid UI development with responsive design.",
    color: "bg-blue-900",
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" fill="#0F172A"/>
        <path d="M12 6C9.6 6 8.1 7.2 7.5 9.6C8.4 8.4 9.45 8.025 10.65 8.4C11.34 8.6175 11.85 9.135 12.405 9.6975C13.35 10.6575 14.46 11.775 16.5 11.775C18.9 11.775 20.4 10.575 21 8.175C20.1 9.375 19.05 9.75 17.85 9.375C17.16 9.1575 16.65 8.64 16.095 8.0775C15.15 7.1175 14.04 6 12 6ZM7.5 12C5.1 12 3.6 13.2 3 15.6C3.9 14.4 4.95 14.025 6.15 14.4C6.84 14.6175 7.35 15.135 7.905 15.6975C8.85 16.6575 9.96 17.775 12 17.775C14.4 17.775 15.9 16.575 16.5 14.175C15.6 15.375 14.55 15.75 13.35 15.375C12.66 15.1575 12.15 14.64 11.595 14.0775C10.65 13.1175 9.54 12 7.5 12Z" fill="#38BDF8"/>
      </svg>
    ),
  },
  {
    name: "Framer Motion",
    description: "Production-ready motion library for React that makes animations and interactions easy.",
    color: "bg-blue-600",
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="2" fill="#0055FF"/>
        <path d="M12 11.5L6 17.5V5.5L12 11.5Z" fill="white"/>
        <path d="M12 11.5L18 5.5V17.5L12 11.5Z" fill="white"/>
      </svg>
    ),
  },
];

export function TechStack() {
  return (
    <section id="technology" className="py-32 bg-[#030712] text-white relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-repeat opacity-[0.015]"></div>
        <div className="absolute bottom-0 left-0 w-full h-2/3 bg-gradient-to-t from-black/20 to-transparent"></div>
      </div>
      
      <div className="container max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-20"
        >
          <div className="inline-block py-1 px-3 mb-3 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium">
            Powerful Stack
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
            Technology Stack
          </h2>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            Built with cutting-edge technologies to deliver high-performance, scalable marketing automation
          </p>
        </motion.div>

        {/* Tech Cards Grid */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
            {techStack.map((tech, index) => (
              <Dialog key={tech.name}>
                <DialogTrigger asChild>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.4 }}
                    whileHover={{ 
                      y: -8,
                      transition: { duration: 0.2, ease: "easeOut" } 
                    }}
                    className="flex flex-col items-center cursor-pointer group"
                  >
                    {/* Tech icon card */}
                    <div className="relative mb-4">
                      {/* Glow effect on hover */}
                      <div className="absolute -inset-2 rounded-3xl opacity-0 group-hover:opacity-100 bg-gradient-to-r from-red-500/20 to-amber-500/20 blur-xl transition-opacity duration-500"></div>
                      
                      {/* Card container */}
                      <div className="relative h-28 w-28 bg-white/[0.07] backdrop-blur-sm border border-white/10 rounded-2xl flex items-center justify-center overflow-hidden">
                        {/* Background pattern */}
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:8px_8px]"></div>
                        
                        {/* Icon with animation */}
                        <motion.div
                          animate={{ 
                            scale: [1, 1.05, 1],
                          }}
                          transition={{ 
                            duration: 3, 
                            repeat: Infinity,
                            repeatType: "reverse",
                            ease: "easeInOut" 
                          }}
                          className="relative z-10 p-2"
                        >
                          {tech.icon}
                        </motion.div>
                        
                        {/* Bottom indicator */}
                        <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-red-500 to-amber-500 transform translate-y-1 group-hover:translate-y-0 transition-transform duration-300"></div>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-white/80 group-hover:text-white transition-all duration-300">
                      {tech.name}
                    </span>
                  </motion.div>
                </DialogTrigger>
                <DialogContent className="bg-[#0f1015] border border-white/10 backdrop-blur-xl">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-4 text-xl">
                      <div className={`w-12 h-12 ${tech.color} rounded-xl flex items-center justify-center p-2`}>
                        {tech.icon}
                      </div>
                      <span className="text-white">{tech.name}</span>
                    </DialogTitle>
                    <DialogDescription className="text-zinc-400 pt-4 text-base">
                      {tech.description}
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            ))}
          </div>
        </div>
        
        {/* Bottom section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-24 text-center"
        >
          <div className="h-px w-full max-w-md mx-auto bg-gradient-to-r from-transparent via-white/20 to-transparent mb-12"></div>
          <div className="inline-block px-8 py-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
            <p className="text-zinc-400">
              We're constantly evolving our stack to incorporate the latest advancements in 
              <span className="text-white font-medium ml-1">AI and machine learning</span>
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
} 