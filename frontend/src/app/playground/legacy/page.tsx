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
import { NextStepsGuide } from '@/components/playground/NextStepsGuide';

export default function LegacyPlayground() {
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
  
