"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";

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
    <section id="demo" className="py-24 bg-black text-white relative overflow-hidden">
      {/* Background grid pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#4f46e5,transparent_70%)] opacity-20"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 inline-block bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            Try Our AI Video Generator
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Experience the power of our Luma AI integration to create stunning videos from simple text prompts.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Input form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 backdrop-blur-sm"
          >
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-blue-400 mb-2 text-sm font-medium">Text Prompt</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full bg-gray-800/50 text-white border border-gray-700 rounded-lg p-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all min-h-[120px]"
                  placeholder="Describe the video you want to generate... (e.g., A futuristic cityscape with flying cars)"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-blue-400 mb-2 text-sm font-medium">Video Style</label>
                  <select
                    value={videoStyle}
                    onChange={(e) => setVideoStyle(e.target.value as VideoStyle)}
                    className="w-full bg-gray-800/50 text-white border border-gray-700 rounded-lg p-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  >
                    <option value="cinematic">Cinematic</option>
                    <option value="3d-animation">3D Animation</option>
                    <option value="realistic">Realistic</option>
                    <option value="stylized">Stylized</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-blue-400 mb-2 text-sm font-medium">Camera Motion</label>
                  <select
                    value={cameraMotion}
                    onChange={(e) => setCameraMotion(e.target.value as CameraMotion)}
                    className="w-full bg-gray-800/50 text-white border border-gray-700 rounded-lg p-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  >
                    <option value="slow-zoom">Slow Zoom</option>
                    <option value="orbit">Orbit</option>
                    <option value="fixed">Fixed</option>
                    <option value="pan">Pan</option>
                  </select>
                </div>
              </div>
              
              <div className="text-right">
                <button
                  type="submit"
                  disabled={isGenerating || !prompt}
                  className={`px-6 py-3 rounded-lg ${
                    isGenerating || !prompt
                      ? "bg-gray-700 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  } text-white font-medium transition-all shadow-lg shadow-blue-600/20`}
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
            
            <div className="mt-6 text-sm text-gray-400">
              <p className="font-medium text-blue-400 mb-1">Pro Tips:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Be specific with your description for better results</li>
                <li>Include details about lighting, mood, and setting</li>
                <li>The more detailed your prompt, the better the output</li>
              </ul>
            </div>
          </motion.div>
          
          {/* Video preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden backdrop-blur-sm flex items-center justify-center"
          >
            {generatedVideo ? (
              <video
                autoPlay
                loop
                muted
                className="w-full h-full object-cover"
                src={generatedVideo}
              />
            ) : (
              <div className="text-center p-8">
                <div className="w-20 h-20 mx-auto mb-4 opacity-30">
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 10L19.5528 7.72361C20.2177 7.39116 21 7.87465 21 8.61803V15.382C21 16.1253 20.2177 16.6088 19.5528 16.2764L15 14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M5 18H13C14.1046 18 15 17.1046 15 16V8C15 6.89543 14.1046 6 13 6H5C3.89543 6 3 6.89543 3 8V16C3 17.1046 3.89543 18 5 18Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="text-xl font-medium mb-2">Video Preview</h3>
                <p className="text-gray-400">
                  Enter a prompt and click "Generate Video" to see your creation here
                </p>
              </div>
            )}
          </motion.div>
        </div>
