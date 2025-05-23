"use client";

import { useState, useCallback, useRef, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';

// Simplified types for easier use
interface VideoGenerationRequest {
  text: string;
  actor_id: string;
  actor_video_url: string;
  language?: string;
  voice_preset?: string;
  voice_id?: string;
  project_id?: string;
  user_id?: string;
  workspace_id?: string;
}

interface VideoGenerationResult {
  job_id: string;
  video_url: string;
  audio_url?: string;
  thumbnail_url?: string;
  processing_time?: number;
}

interface UseVideoGenerationOptions {
  pollingInterval?: number;
  onProgress?: (progress: number, step?: string) => void;
  onComplete?: (result: VideoGenerationResult) => void;
}

export function useVideoGeneration(options: UseVideoGenerationOptions = {}) {
  const { 
    pollingInterval = 2000,
    onProgress,
    onComplete
  } = options;

  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VideoGenerationResult | null>(null);

  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const currentJobRef = useRef<string | null>(null);

  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearTimeout(pollingRef.current);
      }
    };
  }, []);

  // Reset state
  const reset = useCallback(() => {
    if (pollingRef.current) {
      clearTimeout(pollingRef.current);
      pollingRef.current = null;
    }
    currentJobRef.current = null;
    setIsGenerating(false);
    setProgress(0);
    setCurrentStep(null);
    setError(null);
    setResult(null);
  }, []);

  // Poll job status
  const pollJobStatus = useCallback(async (jobId: string) => {
    try {
      const response = await fetch(`/api/v1/video-generation/status/${jobId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch status: ${response.status}`);
      }

      const data = await response.json();
      
      // Update progress
      const newProgress = data.progress_percentage || 0;
      setProgress(newProgress);
      setCurrentStep(data.current_step || null);
      
      // Call progress callback
      onProgress?.(newProgress, data.current_step);

      if (data.status === 'completed' && data.result) {
        // Success!
        let videoUrl = data.result.video_url;
        let audioUrl = data.result.audio_url;
        
        // Enhanced blob_url extraction - prioritize blob storage URLs
        // Check if we can get a better video URL from the lipsync step
        if (data.steps) {
          const lipsyncStep = data.steps.find((step: any) => step.step === 'lipsync');
          if (lipsyncStep?.result?.blob_url) {
            videoUrl = lipsyncStep.result.blob_url;
            console.log('Using blob_url from lipsync step:', videoUrl);
          }
          
          // Also check for better audio URL from TTS step
          const ttsStep = data.steps.find((step: any) => step.step === 'text_to_speech');
          if (ttsStep?.result?.blob_url) {
            audioUrl = ttsStep.result.blob_url;
            console.log('Using blob_url from TTS step:', audioUrl);
          }
        }
        
        const result: VideoGenerationResult = {
          job_id: jobId,
          video_url: videoUrl,
          audio_url: audioUrl,
          thumbnail_url: data.result.thumbnail_url,
          processing_time: data.result.processing_time
        };
        
        setResult(result);
        setIsGenerating(false);
        setProgress(100);
        currentJobRef.current = null;
        
        onComplete?.(result);
        
        toast({
          title: "🎬 Video Ready!",
          description: "Your lip-synced video has been generated successfully.",
        });

      } else if (data.status === 'error') {
        // Error occurred
        const errorMsg = data.error || 'Video generation failed';
        setError(errorMsg);
        setIsGenerating(false);
        currentJobRef.current = null;
        
        toast({
          title: "Generation Failed",
          description: errorMsg,
          variant: 'destructive',
        });

      } else {
        // Still processing, continue polling
        pollingRef.current = setTimeout(() => {
          if (currentJobRef.current === jobId) {
            pollJobStatus(jobId);
          }
        }, pollingInterval);
      }

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to check status';
      setError(errorMsg);
      setIsGenerating(false);
      currentJobRef.current = null;
      
      toast({
        title: "Status Check Failed",
        description: errorMsg,
        variant: 'destructive',
      });
    }
  }, [onProgress, onComplete, pollingInterval, toast]);

  // Main generation function
  const generateVideo = useCallback(async (request: VideoGenerationRequest) => {
    try {
      // Reset previous state
      setError(null);
      setResult(null);
      setProgress(0);
      setCurrentStep(null);
      setIsGenerating(true);

      console.log('Starting video generation:', request);

      const response = await fetch('/api/v1/video-generation/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: request.text,
          actor_id: request.actor_id,
          actor_video_url: request.actor_video_url,
          language: request.language || 'english',
          voice_preset: request.voice_preset,
          voice_id: request.voice_id,
          project_id: request.project_id,
          user_id: request.user_id,
          workspace_id: request.workspace_id,
          save_result: true
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('Job started:', data);

      // Store job ID and start polling
      currentJobRef.current = data.job_id;
      setCurrentStep(data.current_step);
      setProgress(data.progress_percentage || 0);

      // Start polling for updates
      pollJobStatus(data.job_id);

      return data.job_id;

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to start generation';
      console.error('Generation error:', errorMsg);
      
      setError(errorMsg);
      setIsGenerating(false);
      currentJobRef.current = null;

      toast({
        title: "Generation Failed",
        description: errorMsg,
        variant: 'destructive',
      });

      throw err;
    }
  }, [pollJobStatus, toast]);

  // Cancel generation
  const cancel = useCallback(() => {
    if (pollingRef.current) {
      clearTimeout(pollingRef.current);
      pollingRef.current = null;
    }
    currentJobRef.current = null;
    setIsGenerating(false);
    setError('Generation cancelled');
    
    toast({
      title: "Generation Cancelled",
      description: "Video generation has been cancelled.",
    });
  }, [toast]);

  return {
    // State
    isGenerating,
    progress,
    currentStep,
    error,
    result,
    
    // Actions  
    generateVideo,
    cancel,
    reset
  };
} 