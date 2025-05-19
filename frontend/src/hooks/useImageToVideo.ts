import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface VideoGenerationRequest {
  image_url?: string;
  prompt?: string;
  duration?: string;
  aspect_ratio?: string;
  negative_prompt?: string;
  cfg_scale?: number;
}

interface VideoJob {
  job_id: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  created_at?: number;
  updated_at?: number;
  result?: {
    video_url?: string;
    preview_image_url?: string;
    [key: string]: any;
  };
  error?: string;
}

