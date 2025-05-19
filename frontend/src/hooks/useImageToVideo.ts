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

export function useImageToVideo() {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [currentJobStatus, setCurrentJobStatus] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Generate video from URL
  const generateFromUrl = useCallback(async (request: VideoGenerationRequest) => {
    setError(null);
    setIsGenerating(true);
    
    try {
      // Log the request for debugging
      console.log('Sending image-to-video request:', request);
      
      const response = await fetch('/api/v1/image-to-video/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        throw new Error(`Error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('API success response:', data);
      setCurrentJobId(data.job_id);
      setCurrentJobStatus(data.status);
      
      // Start polling for job status
      if (data.job_id) {
        pollJobStatus(data.job_id);
      }
      
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start video generation';
      console.error('Video generation error:', message);
      setError(message);
      setIsGenerating(false);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      return null;
    }
  }, [toast]);

