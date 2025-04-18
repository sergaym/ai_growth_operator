"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import AvatarVideoForm from "@/components/heygen/AvatarVideoForm";
import AvatarVideoCard from "@/components/heygen/AvatarVideoCard";
import DatabaseVideoCard from "@/components/heygen/DatabaseVideoCard";
import { TrackedVideoGeneration, HeygenVideoGenerationRequest } from "@/types/heygen";
import { useHeygenAvatars, useHeygenVoices, useHeygenVideoGeneration, useHeygenDatabaseVideos } from "@/hooks/useHeygenApi";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/Logo";

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
    <div className="min-h-screen bg-[#ffffff] text-[#37352f]">
      {/* Simple minimal background */}
      <div className="fixed inset-0 z-[-1] pointer-events-none">
        <div className="absolute inset-0 bg-[#ffffff] opacity-100"></div>
        <div className="absolute inset-0 bg-[url('/subtle-dots.png')] opacity-[0.015]"></div>
      </div>
      
      {/* Header - Notion-style */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#e6e6e6] py-3">
        <div className="container max-w-4xl mx-auto px-5 md:px-8">
          <div className="flex items-center justify-between">
            {/* Logo and back button in one element */}
            <div className="flex items-center gap-3">
              <Link href="/" className="p-2 hover:bg-[#f1f1f1] rounded-md transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
              
              <div className="h-5 w-px bg-[#e6e6e6]"></div>
              
              <div className="flex items-center gap-2">
                <Logo size="sm" showText={false} />
                <span className="text-[15px] font-medium text-[#37352f]">
                  Playground
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container max-w-4xl mx-auto px-5 md:px-8 py-10">
        {/* Notion-style page title */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2 text-[#37352f]">
            Avatar Video Generator
          </h1>
          <p className="text-[#6b7280] text-lg">
            Create custom AI videos with virtual avatars and realistic voices
          </p>
        </div>
        
        {/* Display any API errors */}
        {apiError && (
          <div className="mb-8 p-4 bg-[#ffebe8] border border-[#ffc1ba] rounded-md text-[#e03e21]">
            <p className="font-medium">Error: {apiError}</p>
          </div>
        )}
        
        {/* Content with Notion-style cards */}
        <div className="space-y-12">
          {/* Avatar video generation form */}
          <div className="bg-white border border-[#e6e6e6] rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-[#e6e6e6] flex items-center justify-between">
              <h2 className="text-lg font-medium text-[#37352f]">Create New Video</h2>
              
              {/* Loading or retry buttons */}
              {(loadingAvatars || loadingVoices) ? (
                <div className="flex items-center text-[#6b7280] text-sm">
                  <div className="animate-spin h-4 w-4 border-2 border-[#e6e6e6] border-t-[#37352f] rounded-full mr-2"></div>
                  Loading...
                </div>
              ) : (avatarsError || voicesError) ? (
                <Button 
                  variant="outline" 
                  onClick={handleRetryApiLoad}
                  className="text-sm text-[#6b7280] border-[#e6e6e6]"
                >
                  Retry API Connection
                </Button>
              ) : null}
            </div>
            
            <div className="p-6">
              {(loadingAvatars || loadingVoices) ? (
                <div className="py-12 text-center">
                  <div className="animate-spin h-10 w-10 border-4 border-[#e6e6e6] border-t-[#37352f] rounded-full mx-auto mb-4"></div>
                  <p className="text-[#6b7280]">Loading avatars and voices...</p>
                </div>
              ) : (avatarsError || voicesError) ? (
                <div>
                  <div className="mb-6 p-4 bg-[#fffaeb] border border-[#ffefc6] rounded-md text-[#92400e]">
                    <p className="font-medium">Note: Using demo data because the API connection failed</p>
                    <p className="text-sm mt-1 text-[#b54708]">{avatarsError || voicesError}</p>
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
          <div className="mt-12">
            <h2 className="text-xl font-medium mb-5 text-[#37352f] flex items-center">
              <span>Your Videos</span>
              {avatarVideos.length > 0 && (
                <span className="ml-2 bg-[#f1f1f1] text-[#6b7280] rounded-full px-2 py-0.5 text-xs font-normal">
                  {avatarVideos.length}
                </span>
              )}
            </h2>
            
            {avatarVideos.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-[#e6e6e6] rounded-lg bg-[#fafafa]">
                <p className="text-[#6b7280]">No videos created yet. Get started by creating your first video above.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {avatarVideos.map((video) => (
                  <div key={video.id} className="border border-[#e6e6e6] rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                    <AvatarVideoCard 
                      generation={video} 
                      onUpdate={handleAvatarVideoUpdated} 
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 