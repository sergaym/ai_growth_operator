"use client";
import React, { useState, useEffect } from "react";
import AvatarVideoCard from "@/components/heygen/AvatarVideoCard";
import DatabaseVideoCard from "@/components/heygen/DatabaseVideoCard";
import { TrackedVideoGeneration, HeygenVideoGenerationRequest } from "@/types/heygen";
import { useHeygenAvatars, useHeygenVoices, useHeygenVideoGeneration, useHeygenDatabaseVideos } from "@/hooks/useHeygenApi";
import { AvatarTrainingData } from "@/components/heygen/AvatarCreationForm";
import AvatarCreationForm from "@/components/heygen/AvatarCreationForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

// Component imports
import PlaygroundLayout from "@/components/playground/Layout";
import CreateVideoSection from "@/components/playground/CreateVideoSection";
import VideoList from "@/components/playground/VideoList";
import PlaygroundHeader from '@/components/playground/Header';
import { NextStepsGuide } from '@/components/playground/NextStepsGuide';

export default function Playground() {
  // HeyGen API hooks
  const { avatars: fetchedAvatars, loading: loadingAvatars, error: avatarsError, refetch: refetchAvatars } = useHeygenAvatars();
  const { voices: fetchedVoices, loading: loadingVoices, error: voicesError, refetch: refetchVoices } = useHeygenVoices();
  const { generateVideo, loading: isGenerating, error: generationError } = useHeygenVideoGeneration();
  const { videos: databaseVideos, loading: loadingDatabaseVideos, error: databaseVideosError, refetch: refetchDatabaseVideos } = useHeygenDatabaseVideos();
  
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
  
  // State for active tab
  const [activeTab, setActiveTab] = useState<string>("video-generation");
  
  // State for HeyGen avatar videos
  const [avatarVideos, setAvatarVideos] = useState<TrackedVideoGeneration[]>([]);
  
  // Add state for avatar creation
  const [isCreatingAvatar, setIsCreatingAvatar] = useState<boolean>(false);
  const [avatarCreationError, setAvatarCreationError] = useState<string | null>(null);
  
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

  // Handler for creating a new avatar
  const handleAvatarCreation = async (data: AvatarTrainingData) => {
    try {
      setIsCreatingAvatar(true);
      setAvatarCreationError(null);
      
      // Log the request payload for debugging
      console.log('Sending avatar creation request:', JSON.stringify(data, null, 2));
      
      // Placeholder for API call - in a real implementation, this would call your backend API
      // const result = await yourAPI.createAvatar(data);
      
      // For now, simulate a success response after a delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock response
      const mockResult = {
        success: true,
        avatar_id: `custom-${Date.now()}`,
        avatar_name: data.name,
        gender: data.gender
      };
      
      // After successful creation, refresh the avatars list
      refetchAvatars();
      
      // Switch to video generation tab after successful avatar creation
      setActiveTab("video-generation");
      
      // Return the result
      return mockResult;
    } catch (error) {
      console.error('Failed to create avatar:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error creating avatar';
      setAvatarCreationError(errorMessage);
      throw error;
    } finally {
      setIsCreatingAvatar(false);
    }
  };

  // Render the local videos (stored in browser)
  const renderLocalVideos = () => {
    return avatarVideos.map((video) => (
      <div key={video.id} className="border border-[#e6e6e6] rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
        <AvatarVideoCard 
          generation={video} 
          onUpdate={handleAvatarVideoUpdated} 
        />
      </div>
    ));
  };

  // Render the database videos
  const renderDatabaseVideos = () => {
    return databaseVideos.map((video) => (
      <div key={video.id} className="border border-[#e6e6e6] rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
        <DatabaseVideoCard video={video} />
      </div>
    ));
  };

  // Render avatars grid
  const renderAvatarsGrid = () => {
    if (loadingAvatars) {
      return (
        <div className="py-12 text-center">
          <div className="animate-spin h-10 w-10 border-4 border-[#e6e6e6] border-t-[#37352f] rounded-full mx-auto mb-4"></div>
          <p className="text-[#6b7280]">Loading avatars...</p>
        </div>
      );
    }
    
    if (avatarsError) {
      return (
        <div className="py-6 text-center">
          <p className="text-[#e03e21]">Failed to load avatars: {avatarsError}</p>
        </div>
      );
    }
    
    if (avatars.length === 0) {
      return (
        <div className="py-6 text-center">
          <p className="text-[#6b7280]">No avatars found. Create your first avatar above!</p>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {avatars.map((avatar) => (
          <div key={avatar.avatar_id} className="bg-white p-4 border border-[#e6e6e6] rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-xl font-medium text-gray-600">{avatar.avatar_name.charAt(0)}</span>
              </div>
              <div>
                <h3 className="font-medium text-[#37352f]">{avatar.avatar_name}</h3>
                <p className="text-sm text-gray-500">ID: {avatar.avatar_id}</p>
                <p className="text-sm text-gray-500">Gender: {avatar.gender}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Function to clear all saved videos from localStorage and state
  const handleClearVideos = () => {
    // Confirm before clearing all videos
    if (avatarVideos.length > 0 && window.confirm('Are you sure you want to clear all your saved videos? This action cannot be undone.')) {
      // Clear from localStorage
      localStorage.removeItem('avatarVideos');
      // Clear from state
      setAvatarVideos([]);
    }
  };

  return (
    <PlaygroundLayout
      title="AI Content Studio"
      description="Create and manage professional AI-generated videos with virtual avatars"
      error={apiError}
    >
      {/* Tabs Navigation */}
      <Tabs defaultValue="video-generation" value={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="video-generation">Video Generation</TabsTrigger>
          <TabsTrigger value="your-avatars">Your Avatars</TabsTrigger>
        </TabsList>
        
        {/* Video Generation Tab */}
        <TabsContent value="video-generation" className="mt-6">
          <CreateVideoSection
            avatars={avatars}
            voices={voices}
            loadingAvatars={loadingAvatars}
            loadingVoices={loadingVoices}
            avatarsError={avatarsError}
            voicesError={voicesError}
            isGenerating={isGenerating}
            onVideoGenerated={handleAvatarVideoGenerated}
            onRetryApiLoad={handleRetryApiLoad}
          />
          
          {/* Videos List (only shown in Video Generation tab) */}
          <div className="mt-8">
            <VideoList
              title="Your Videos"
              count={avatarVideos.length}
              noItemsMessage="No videos created yet. Get started by creating your first video above."
              renderItems={renderLocalVideos}
              actionButton={
                avatarVideos.length > 0 ? {
                  label: "Clear All Videos",
                  onClick: handleClearVideos,
                  variant: "danger"
                } : undefined
              }
            />
            
            <VideoList
              title="All Database Videos"
              count={databaseVideos.length}
              loading={loadingDatabaseVideos}
              error={databaseVideosError}
              noItemsMessage="No videos found in the database."
              onRefresh={refetchDatabaseVideos}
              onRetry={refetchDatabaseVideos}
              showRefreshButton={true}
              renderItems={renderDatabaseVideos}
            />
          </div>
        </TabsContent>
        
        {/* Your Avatars Tab */}
        <TabsContent value="your-avatars" className="mt-6">
          <AvatarCreationForm
            onCreateAvatar={handleAvatarCreation}
            isCreating={isCreatingAvatar}
          />
          
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-[#37352f] mb-4">Your Available Avatars</h2>
            {renderAvatarsGrid()}
          </div>
        </TabsContent>
      </Tabs>
    </PlaygroundLayout>
  );
} 