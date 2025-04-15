"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

type VideoStyle = "cinematic" | "3d-animation" | "realistic" | "stylized";
type CameraMotion = "slow-zoom" | "orbit" | "fixed" | "pan";

export function Demo() {
  const [prompt, setPrompt] = useState("");
  const [videoStyle, setVideoStyle] = useState<VideoStyle>("cinematic");
  const [cameraMotion, setCameraMotion] = useState<CameraMotion>("slow-zoom");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    
    // Simulate video generation
    setTimeout(() => {
      setIsGenerating(false);
      setGeneratedVideo("/demo-video.mp4"); // This would be a real video path in production
    }, 3000);
  };

  return (
    <section id="demo" className="py-32 bg-[#030712] text-white relative overflow-hidden">
      {/* Background effect - Revolut style */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#f33_5%,transparent_60%)] opacity-10"></div>
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-repeat opacity-[0.02]"></div>
      </div>
      
      <div className="container max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-block py-1 px-3 mb-3 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium">
            Interactive Demo
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
            Generate AI Videos <span className="bg-gradient-to-r from-red-400 to-amber-400 bg-clip-text text-transparent">in Seconds</span>
          </h2>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            Experience how our Luma AI integration creates stunning videos from simple text prompts
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-6xl mx-auto">
          {/* Input form with Revolut-style glassmorphism */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-red-500/20 via-amber-500/20 to-red-500/20 rounded-2xl blur-md"></div>
            <div className="relative bg-white/[0.07] backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden">
              <form onSubmit={handleSubmit} className="p-6">
                <div className="mb-8">
                  <label className="block text-amber-400 mb-2 text-sm font-medium">Text Prompt</label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full bg-white/5 text-white border border-white/10 rounded-xl p-4 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-all min-h-[120px] placeholder:text-white/30"
                    placeholder="Describe the video you want to generate... (e.g., A futuristic cityscape with flying cars)"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <Label className="text-amber-400 mb-2">Video Style</Label>
                    <Select value={videoStyle} onValueChange={(value) => setVideoStyle(value as VideoStyle)}>
                      <SelectTrigger className="w-full bg-white/5 text-white border border-white/10 rounded-xl p-4 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-all">
                        <SelectValue placeholder="Select video style" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1c1c1c] border-white/10">
                        <SelectItem value="cinematic">Cinematic</SelectItem>
                        <SelectItem value="3d-animation">3D Animation</SelectItem>
                        <SelectItem value="realistic">Realistic</SelectItem>
                        <SelectItem value="stylized">Stylized</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-amber-400 mb-2">Camera Motion</Label>
                    <Select value={cameraMotion} onValueChange={(value) => setCameraMotion(value as CameraMotion)}>
                      <SelectTrigger className="w-full bg-white/5 text-white border border-white/10 rounded-xl p-4 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-all">
                        <SelectValue placeholder="Select camera motion" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1c1c1c] border-white/10">
                        <SelectItem value="slow-zoom">Slow Zoom</SelectItem>
                        <SelectItem value="orbit">Orbit</SelectItem>
                        <SelectItem value="fixed">Fixed</SelectItem>
                        <SelectItem value="pan">Pan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isGenerating || !prompt}
                    className={`px-8 py-4 rounded-xl text-base font-medium transition-all ${
                      isGenerating || !prompt
                        ? "bg-zinc-700/50 cursor-not-allowed text-white/50"
                        : "bg-gradient-to-r from-red-500 to-amber-500 text-white shadow-lg shadow-red-500/20 hover:shadow-red-500/30 hover:translate-y-[-1px]"
                    }`}
                  >
                    {isGenerating ? (
                      <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating Video...
                      </div>
                    ) : (
                      "Generate Video"
                    )}
                  </button>
                </div>
              </form>
              
              {/* Pro tips with icon.me style badge */}
              <div className="px-6 py-4 border-t border-white/5 bg-white/[0.02]">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center mt-0.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 16V12M12 8H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-amber-400 text-sm mb-1">Pro Tips:</p>
                    <ul className="text-zinc-400 text-sm space-y-1">
                      <li>• Be specific with your description for better results</li>
                      <li>• Include details about lighting, mood, and setting</li>
                      <li>• The more detailed your prompt, the better the output</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Video preview with Coca-Cola inspired design */}
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-red-500/30 to-amber-500/20 rounded-2xl blur-lg"></div>
            
            <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-white/[0.03] backdrop-blur-sm shadow-2xl shadow-black/50 h-full min-h-[350px] flex items-center justify-center">
              {/* Browser-like top bar for aesthetic */}
              <div className="absolute top-0 inset-x-0 h-8 bg-black/50 backdrop-blur-md flex items-center px-4 border-b border-white/5">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                </div>
                <div className="mx-auto text-xs text-white/50 font-medium">Video Preview</div>
              </div>
              
              {generatedVideo ? (
                <div className="w-full h-full">
                  <video
                    autoPlay
                    loop
                    muted
                    className="w-full h-full object-cover"
                    src={generatedVideo}
                  />
                  
                  {/* Overlay controls */}
                  <div className="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-black/80 to-transparent flex items-center px-4">
                    <div className="flex items-center gap-4 text-white/80">
                      <button className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M15.5 7.5L15.5 16.5M8.5 7.5L8.5 16.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      <div className="text-xs font-medium">00:05 / 00:15</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center p-8 relative z-10">
                  <div className="w-24 h-24 mx-auto mb-6">
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-red-500/20 to-amber-500/20 backdrop-blur-lg border border-white/10 flex items-center justify-center">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15 10L19.5528 7.72361C20.2177 7.39116 21 7.87465 21 8.61803V15.382C21 16.1253 20.2177 16.6088 19.5528 16.2764L15 14" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M5 18H13C14.1046 18 15 17.1046 15 16V8C15 6.89543 14.1046 6 13 6H5C3.89543 6 3 6.89543 3 8V16C3 17.1046 3.89543 18 5 18Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-2xl font-medium mb-2">Your Video Will Appear Here</h3>
                  <p className="text-zinc-400">
                    Enter a prompt and click "Generate Video" to see your AI-generated video
                  </p>
                </div>
              )}
            </div>
            
            {/* Floating label element like amie.so */}
            <motion.div
              animate={{
                y: [0, -8, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -bottom-6 -right-6 z-20"
            >
              <div className="px-4 py-2 bg-red-500 rounded-full text-white text-sm font-medium shadow-lg shadow-red-500/30">
                AI Generated ✨
              </div>
            </motion.div>
          </motion.div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-24 text-center"
        >
          <div className="inline-block mx-auto px-6 py-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl">
            <p className="text-zinc-400">
              Our AI video generator is just one example of how the <span className="text-white font-medium">AI Growth Operator</span> helps you create engaging marketing content.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
} 