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

