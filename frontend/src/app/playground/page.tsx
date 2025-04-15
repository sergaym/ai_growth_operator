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
          {activeTab === "avatarVideo" ? (
            <div className="space-y-8">
              {/* Display any API errors */}
              {apiError && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl mb-4">
                  <p className="font-medium">Error: {apiError}</p>
                </div>
              )}
              
              {/* Avatar video generation form - show form even if API fails */}
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-red-500/20 via-amber-500/20 to-red-500/20 rounded-2xl blur-md"></div>
                <div className="relative bg-white/[0.07] backdrop-blur-md border border-white/10 rounded-xl p-6">
                  <h3 className="text-xl font-medium mb-4">Create Avatar Video</h3>
                  
                  {(loadingAvatars || loadingVoices) ? (
                    <div className="p-8 text-center">
                      <div className="animate-spin h-10 w-10 border-4 border-red-500/30 border-t-red-500 rounded-full mx-auto mb-4"></div>
                      <p className="text-zinc-400">Loading avatars and voices...</p>
                    </div>
                  ) : (avatarsError || voicesError) ? (
                    <div>
                      <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 p-4 rounded-xl mb-4">
                        <p className="font-medium">Note: Using demo data because the API connection failed</p>
                        <p className="text-sm mt-1">{avatarsError || voicesError}</p>
                        <button 
                          onClick={handleRetryApiLoad}
                          className="mt-3 px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 rounded-lg text-sm font-medium transition-colors"
                        >
                          Retry API Connection
                        </button>
                      </div>
                      <AvatarVideoForm
                        onVideoGenerated={handleAvatarVideoGenerated}
                        avatars={avatars}
                        voices={voices}
                        isGenerating={isGenerating}
                      />
                    </div>
                  ) : (
                    <AvatarVideoForm
                      onVideoGenerated={handleAvatarVideoGenerated}
                      avatars={avatars}
                      voices={voices}
                      isGenerating={isGenerating}
                    />
                  )}
                </div>
              </div>
              
              {/* Avatar video history */}
              <div>
                <h3 className="text-xl font-medium mb-4">Your Avatar Videos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {avatarVideos.map((video) => (
                    <AvatarVideoCard 
                      key={video.id} 
                      generation={video} 
                      onUpdate={handleAvatarVideoUpdated} 
                    />
                  ))}
                  
                  {avatarVideos.length === 0 && (
                    <div className="col-span-2 py-12 text-center text-zinc-400">
                      No avatar videos yet. Create your first one above!
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : activeTab === "video" ? (
            <div className="space-y-8">
              {/* Video generation form */}
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-red-500/20 via-amber-500/20 to-red-500/20 rounded-2xl blur-md"></div>
                <div className="relative bg-white/[0.07] backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden">
                  <form onSubmit={handleVideoGeneration} className="p-6">
                    <div className="mb-6">
                      <label className="block text-amber-400 mb-2 text-sm font-medium">Video Prompt</label>
                      <textarea
                        value={newVideoPrompt}
                        onChange={(e) => setNewVideoPrompt(e.target.value)}
                        className="w-full bg-white/5 text-white border border-white/10 rounded-xl p-4 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-all min-h-[100px] placeholder:text-white/30"
                        placeholder="Describe the video you want to generate..."
                        required
                      />
                    </div>
                    
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isVideoGenerating || !newVideoPrompt.trim()}
                        className={`px-6 py-3 rounded-xl text-base font-medium transition-all ${
                          isVideoGenerating || !newVideoPrompt.trim()
                            ? "bg-zinc-700/50 cursor-not-allowed text-white/50"
                            : "bg-gradient-to-r from-red-500 to-amber-500 text-white shadow-lg shadow-red-500/20 hover:shadow-red-500/30 hover:translate-y-[-1px]"
                        }`}
                      >
                        {isVideoGenerating ? (
                          <div className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Generating...
                          </div>
                        ) : (
                          "Generate Video"
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
              
              {/* Video history */}
              <div>
                <h3 className="text-xl font-medium mb-4">Your Generations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {videoGenerations.map((video) => (
                    <div 
                      key={video.id} 
                      className="bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden"
                    >
                      <div className="aspect-video relative">
                        {video.status === "completed" && video.videoUrl ? (
                          <video
                            src={video.videoUrl}
                            className="absolute inset-0 w-full h-full object-cover"
                            autoPlay
                            loop
                            muted
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            {video.status === "pending" ? (
                              <div className="flex flex-col items-center">
                                <svg className="animate-spin h-10 w-10 text-amber-500 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span className="text-sm text-white/80">Processing...</span>
                              </div>
                            ) : (
                              <div className="text-red-400">Generation failed</div>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            video.status === "completed" 
                              ? "bg-green-500/20 text-green-400" 
                              : video.status === "pending" 
                                ? "bg-amber-500/20 text-amber-400"
                                : "bg-red-500/20 text-red-400"
                          }`}>
                            {video.status.charAt(0).toUpperCase() + video.status.slice(1)}
                          </span>
                          <span className="text-zinc-500 text-sm">
                            {new Date(video.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm text-white line-clamp-2">{video.prompt}</p>
                      </div>
                    </div>
                  ))}
                  
                  {videoGenerations.length === 0 && (
                    <div className="col-span-2 py-12 text-center text-zinc-400">
                      No video generations yet. Create your first one above!
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Campaigns dashboard */}
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-medium">Active Campaigns</h3>
                <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-amber-500 text-white text-sm font-medium shadow-lg shadow-red-500/20 hover:shadow-red-500/30 hover:translate-y-[-1px] transition-all flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  New Campaign
                </button>
              </div>
              
              <div className="overflow-hidden rounded-xl border border-white/10">
                <table className="w-full">
                  <thead>
                    <tr className="bg-white/[0.03]">
                      <th className="text-left py-3 px-4 text-sm font-medium text-zinc-300">Campaign Name</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-zinc-300">Platform</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-zinc-300">Budget</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-zinc-300">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-zinc-300">Performance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {campaigns.map((campaign) => (
                      <tr key={campaign.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-4 px-4">
                          <div className="font-medium">{campaign.name}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            {campaign.platform === "facebook" ? (
                              <span className="flex items-center gap-2 text-blue-400">
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                </svg>
                                Facebook
                              </span>
                            ) : campaign.platform === "google" ? (
                              <span className="flex items-center gap-2 text-red-400">
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M22.5 12.5c0-5.523-4.477-10-10-10s-10 4.477-10 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12.5h2.54V9.844c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12.5h2.773l-.443 2.89h-2.33v6.988C18.843 21.628 22.5 17.49 22.5 12.5z"/>
                                </svg>
                                Google
                              </span>
                            ) : (
                              <span className="flex items-center gap-2 text-teal-400">
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M12.53.02C13.84 0 15.14.01 16.44.02c.13 1.73.83 3.22 1.88 4.31A6.4 6.4 0 0 0 21.95 6v6.53h-4.13v-6.53a11.56 11.56 0 0 1-10.64.02v6.52H3.05V6a6.4 6.4 0 0 0 3.63-1.67A6.45 6.45 0 0 0 8.56.02c1.31-.01 2.61.01 3.91 0M0 15.5h24V24H0z"/>
                                </svg>
                                TikTok
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">${campaign.budget.toLocaleString()}</td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            campaign.status === "active" 
                              ? "bg-green-500/20 text-green-400" 
                              : campaign.status === "paused" 
                                ? "bg-amber-500/20 text-amber-400"
                                : "bg-blue-500/20 text-blue-400"
                          }`}>
                            {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-4">
                            <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-red-500 to-amber-500 rounded-full"
                                style={{ 
                                  width: `${Math.min(campaign.metrics.ctr * 10, 100)}%` 
                                }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">
                              {campaign.metrics.ctr}% CTR
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                    
                    {campaigns.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-zinc-400">
                          No campaigns yet. Create your first campaign to get started!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Campaign stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {campaigns.length > 0 && (
                  <>
                    <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6">
                      <div className="text-sm text-zinc-400 mb-1">Total Impressions</div>
                      <div className="text-2xl font-bold">
                        {campaigns.reduce((sum, camp) => sum + camp.metrics.impressions, 0).toLocaleString()}
                      </div>
                      <div className="text-xs text-green-400 mt-2 flex items-center">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1">
                          <path d="M18 15L12 9L6 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        12.3% from last week
                      </div>
                    </div>
                    
                    <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6">
                      <div className="text-sm text-zinc-400 mb-1">Total Clicks</div>
                      <div className="text-2xl font-bold">
                        {campaigns.reduce((sum, camp) => sum + camp.metrics.clicks, 0).toLocaleString()}
                      </div>
                      <div className="text-xs text-green-400 mt-2 flex items-center">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1">
                          <path d="M18 15L12 9L6 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        8.7% from last week
                      </div>
                    </div>
                    
                    <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6">
                      <div className="text-sm text-zinc-400 mb-1">Avg. CTR</div>
                      <div className="text-2xl font-bold">
                        {(campaigns.reduce((sum, camp) => sum + camp.metrics.ctr, 0) / campaigns.length).toFixed(2)}%
                      </div>
                      <div className="text-xs text-green-400 mt-2 flex items-center">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1">
                          <path d="M18 15L12 9L6 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        2.1% from last week
                      </div>
                    </div>
                    
                    <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6">
                      <div className="text-sm text-zinc-400 mb-1">Total Budget</div>
                      <div className="text-2xl font-bold">
                        ${campaigns.reduce((sum, camp) => sum + camp.budget, 0).toLocaleString()}
                      </div>
                      <div className="text-xs text-amber-400 mt-2 flex items-center">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1">
                          <path d="M18 9L12 15L6 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        5.3% from last week
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 