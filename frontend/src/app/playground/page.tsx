"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import AvatarVideoForm from "@/components/heygen/AvatarVideoForm";
import AvatarVideoCard from "@/components/heygen/AvatarVideoCard";
import { TrackedVideoGeneration, HeygenVideoGenerationRequest } from "@/types/heygen";
import { useHeygenAvatars, useHeygenVoices, useHeygenVideoGeneration } from "@/hooks/useHeygenApi";

// These types would eventually come from your API responses
type VideoGeneration = {
  id: string;
  prompt: string;
  status: "pending" | "completed" | "failed";
  createdAt: string;
  videoUrl?: string;
};

type AdCampaign = {
  id: string;
  name: string;
  status: "active" | "paused" | "completed";
  platform: "facebook" | "google" | "tiktok";
  budget: number;
  metrics: {
    impressions: number;
    clicks: number;
    ctr: number;
    conversions: number;
    cpa: number;
  };
};

export default function Playground() {
  // State for tabs and content - Fixed to "avatarVideo"
  const [activeTab, setActiveTab] = useState<"video" | "avatarVideo" | "campaigns">("avatarVideo");
  
  // HeyGen API hooks
  const { avatars: fetchedAvatars, loading: loadingAvatars, error: avatarsError, refetch: refetchAvatars } = useHeygenAvatars();
  const { voices: fetchedVoices, loading: loadingVoices, error: voicesError, refetch: refetchVoices } = useHeygenVoices();
  const { generateVideo, loading: isGenerating, error: generationError } = useHeygenVideoGeneration();
  
  // Use mock data when API fails
  const avatars = fetchedAvatars.length > 0 ? fetchedAvatars : [
    { 
      avatar_id: "Abigail_sitting_sofa_side", 
      avatar_name: "Abigail", 
      gender: "female" 
    },
    { 
      avatar_id: "Dale_casual_sitting", 
      avatar_name: "Dale", 
      gender: "male" 
    }
  ];
  
  const voices = fetchedVoices.length > 0 ? fetchedVoices : [
    { 
      voice_id: "1985984feded457b9d013b4f6551ac94", 
      name: "Olivia", 
      gender: "female", 
      language: "English" 
    },
    { 
      voice_id: "52b8ddf4120942e4b61b62d38a0404e4", 
      name: "Michael", 
      gender: "male", 
      language: "English" 
    }
  ];
  
  // State for error display
  const [apiError, setApiError] = useState<string | null>(null);
  
  // State for HeyGen avatar videos
  const [avatarVideos, setAvatarVideos] = useState<TrackedVideoGeneration[]>([]);
  
  // Restore avatar videos from localStorage on component mount
  useEffect(() => {
    const savedVideos = localStorage.getItem('avatarVideos');
    if (savedVideos) {
      try {
        setAvatarVideos(JSON.parse(savedVideos));
      } catch (e) {
        console.error('Failed to parse saved avatar videos', e);
      }
    }
  }, []);
  
  // Save avatar videos to localStorage when they change
  useEffect(() => {
    if (avatarVideos.length > 0) {
      localStorage.setItem('avatarVideos', JSON.stringify(avatarVideos));
    }
  }, [avatarVideos]);
  
  // Function to retry loading the API resources
  const handleRetryApiLoad = () => {
    refetchAvatars();
    refetchVoices();
  };
  
  // Handler for adding a new avatar video
  const handleAvatarVideoGenerated = async (formData: HeygenVideoGenerationRequest) => {
    try {
      setApiError(null);
      
      // Log the request payload for debugging
      console.log('Sending HeyGen video generation request:', JSON.stringify(formData, null, 2));
      
      // Set default width and height if not provided
      const requestData = {
        ...formData,
        width: formData.width || 1280,
        height: formData.height || 720,
        voice_pitch: formData.voice_pitch || 0
      };
      
      // If we have connection issues with the API, simulate a success response
      let result: { video_id: string; status: "pending" | "processing" | "completed" | "failed"; video_url?: string; thumbnail_url?: string };
      try {
        // Try to generate video with real API
        result = await generateVideo(requestData);
      } catch (err) {
        console.warn('API connection failed, using mock video generation response');
        // Mock response for demo purposes
        result = {
          video_id: `mock-${Date.now()}`,
          status: "pending" as const
        };
        
        // Simulate completion after a delay
        setTimeout(() => {
          const updatedGeneration: TrackedVideoGeneration = {
            id: result.video_id,
            prompt: formData.prompt,
            avatarId: formData.avatar_id,
            voiceId: formData.voice_id,
            avatarName: avatars.find(a => a.avatar_id === formData.avatar_id)?.avatar_name,
            voiceName: voices.find(v => v.voice_id === formData.voice_id)?.name,
            status: "completed",
            createdAt: new Date().toISOString(),
            videoUrl: "/demo-video.mp4",
            thumbnailUrl: "/demo-thumbnail.jpg",
          };
          handleAvatarVideoUpdated(updatedGeneration);
        }, 5000);
      }
      
      // Find the avatar and voice names from selected IDs
      const selectedAvatar = avatars.find(a => a.avatar_id === formData.avatar_id);
      const selectedVoice = voices.find(v => v.voice_id === formData.voice_id);
      
      // Create a tracked generation for the UI
      const trackedGeneration: TrackedVideoGeneration = {
        id: result.video_id,
        prompt: formData.prompt,
        avatarId: formData.avatar_id,
        voiceId: formData.voice_id,
        avatarName: selectedAvatar?.avatar_name,
        voiceName: selectedVoice?.name,
        status: result.status,
        createdAt: new Date().toISOString(),
        videoUrl: result.video_url,
        thumbnailUrl: result.thumbnail_url,
      };
      
      // Add to state
      setAvatarVideos(prev => [trackedGeneration, ...prev]);
      
      return result;
    } catch (error) {
      console.error('Failed to generate avatar video:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error generating video';
      setApiError(errorMessage);
      throw error;
    }
  };
  
  // Handler for updating an existing avatar video
  const handleAvatarVideoUpdated = (updatedGeneration: TrackedVideoGeneration) => {
    setAvatarVideos(prev => 
      prev.map(video => 
        video.id === updatedGeneration.id ? updatedGeneration : video
      )
    );
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      {/* Global background elements */}
      <div className="fixed inset-0 z-[-1] pointer-events-none">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02] mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#f33_5%,transparent_40%)] opacity-10"></div>
        <div className="absolute bottom-0 left-0 right-0 h-[150px] bg-gradient-to-t from-black to-transparent"></div>
      </div>
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#030712]/80 backdrop-blur-md border-b border-white/5">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="h-16 flex items-center justify-between">
            {/* Logo and title */}
            <Link href="/" className="flex items-center gap-3">
              <div className="relative w-8 h-8">
                <div className="absolute inset-0 rounded-lg bg-gradient-to-tr from-red-500 to-amber-500"></div>
                <div className="absolute inset-[2px] bg-[#030712] rounded-md flex items-center justify-center text-white font-bold">
                  A
                </div>
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                AI Growth Operator
              </span>
            </Link>
            
            {/* Navigation back to home */}
            <Link 
              href="/" 
              className="px-4 py-2 rounded-lg bg-white/[0.07] border border-white/10 hover:bg-white/[0.1] transition-colors text-sm font-medium text-white flex items-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 12H19M5 12L11 18M5 12L11 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Back to Home
            </Link>
          </div>
        </div>
      </header>
      
      <main className="container max-w-7xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">
            <span className="bg-gradient-to-r from-red-400 to-amber-400 bg-clip-text text-transparent">
              Playground
            </span>
          </h1>
          <p className="text-zinc-400">
            Experiment with the AI Growth Operator capabilities and see them in action
          </p>
        </div>
        
        {/* Tabs */}
        <div className="mb-8 border-b border-white/10">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab("avatarVideo")}
              className={`pb-4 relative ${
                activeTab === "avatarVideo"
                  ? "text-white font-medium"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <span>Avatar Video</span>
              {activeTab === "avatarVideo" && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-500 to-amber-500"
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab("video")}
              className={`pb-4 relative ${
                activeTab === "video"
                  ? "text-white font-medium"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <span>Video Generation</span>
              {activeTab === "video" && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-500 to-amber-500"
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab("campaigns")}
              className={`pb-4 relative ${
                activeTab === "campaigns"
                  ? "text-white font-medium"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <span>Ad Campaigns</span>
              {activeTab === "campaigns" && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-500 to-amber-500"
                />
              )}
            </button>
          </div>
        </div>
        
        {/* Content based on active tab */}
        <div className="min-h-[calc(100vh-300px)]">
            
            {/* Avatar video history */}
            <div>
              <h3 className="text-xl font-medium mb-4 text-slate-800">Your Avatar Videos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {avatarVideos.map((video) => (
                  <AvatarVideoCard 
                    key={video.id} 
                    generation={video} 
                    onUpdate={handleAvatarVideoUpdated} 
                  />
                ))}
                
                {avatarVideos.length === 0 && (
                  <div className="col-span-2 py-12 text-center text-slate-500 bg-white border border-slate-200 rounded-xl">
                    No avatar videos yet. Create your first one above!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 