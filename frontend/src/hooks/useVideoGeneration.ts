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
