"use client";

import { useState, useCallback, useRef } from 'react';
import { useToast } from '@/components/ui/use-toast';

// Types for the video generation workflow
interface VideoGenerationRequest {
  text: string;
  actor_id: string;
  actor_video_url: string;
  project_id?: string;
  voice_id?: string;
  voice_preset?: string;
  language?: string;
  model_id?: string;
  voice_settings?: {
    stability?: number;
    similarity_boost?: number;
    style?: number;
    use_speaker_boost?: boolean;
  };
  save_result?: boolean;
  user_id?: string;
  workspace_id?: string;
}

interface WorkflowStep {
  step: string;
  status: string;
  started_at?: number;
  completed_at?: number;
  error?: string;
  result?: any;
}

interface VideoGenerationJob {
  job_id: string;
  status: 'pending' | 'tts_processing' | 'tts_completed' | 'lipsync_processing' | 'completed' | 'error';
  created_at: number;
  updated_at: number;
  steps: WorkflowStep[];
  current_step?: string;
  progress_percentage?: number;
  estimated_completion?: number;
  result?: {
    text: string;
    actor_id: string;
    project_id?: string;
    audio_url?: string;
    video_url: string;
    thumbnail_url?: string;
    audio_duration?: number;
    video_duration?: number;
    file_size?: number;
    processing_time?: number;
  };
  error?: string;
}

interface UseVideoGenerationOptions {
  pollingInterval?: number; // in milliseconds
  onProgress?: (progress: number, currentStep?: string) => void;
  onStepComplete?: (step: WorkflowStep) => void;
}

interface UseVideoGenerationState {
  isGenerating: boolean;
  currentJob: VideoGenerationJob | null;
  currentStep: string | null;
  progress: number;
  videoUrl: string | null;
  audioUrl: string | null;
  error: string | null;
  steps: WorkflowStep[];
}

export function useVideoGeneration(options: UseVideoGenerationOptions = {}) {
  const { 
    pollingInterval = 2000,
    onProgress,
    onStepComplete
  } = options;

  const { toast } = useToast();
  const [state, setState] = useState<UseVideoGenerationState>({
    isGenerating: false,
    currentJob: null,
    currentStep: null,
    progress: 0,
    videoUrl: null,
    audioUrl: null,
    error: null,
    steps: []
  });

  const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Start video generation workflow
  const generateVideo = useCallback(async (request: VideoGenerationRequest) => {
    try {
      setState(prev => ({
        ...prev,
        isGenerating: true,
        currentJob: null,
        currentStep: null,
        progress: 0,
        videoUrl: null,
        audioUrl: null,
        error: null,
        steps: []
      }));

      // Start the workflow
      console.log('Starting video generation workflow:', request);
      
      const response = await fetch('/api/v1/video-generation/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const jobData: VideoGenerationJob = await response.json();
      console.log('Video generation job started:', jobData);

      setState(prev => ({
        ...prev,
        currentJob: jobData,
        currentStep: jobData.current_step || null,
        progress: jobData.progress_percentage || 0,
        steps: jobData.steps || []
      }));

      // Start polling for status updates
      startPolling(jobData.job_id);

      return jobData;

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start video generation';
      console.error('Error starting video generation:', message);
      
      setState(prev => ({
        ...prev,
        isGenerating: false,
        error: message
      }));

      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });

      throw err;
    }
  }, [toast]);

