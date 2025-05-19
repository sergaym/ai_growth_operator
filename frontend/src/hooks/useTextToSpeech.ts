"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  listVoices,
  listVoicePresets,
  generateSpeech,
  checkJobStatus,
  getAudioUrl
} from '@/services';
import type {
  Voice,
  VoiceSettings,
  GenerateSpeechRequest,
  SpeechGenerationResponse,
  JobStatusResponse
} from '@/types/text-to-speech';

interface UseTextToSpeechOptions {
  pollingInterval?: number; // in milliseconds
  defaultLanguage?: string;
}

interface UseTextToSpeechState {
  voices: Voice[];
  voicePresets: Record<string, string>;
  isLoadingVoices: boolean;
  isGenerating: boolean;
  currentJobId: string | null;
  currentJobStatus: string | null;
  audioUrl: string | null;
  error: string | null;
}

export function useTextToSpeech(options: UseTextToSpeechOptions = {}) {
  const { 
    pollingInterval = 2000, 
    defaultLanguage = 'english' 
  } = options;

  const [state, setState] = useState<UseTextToSpeechState>({
    voices: [],
    voicePresets: {},
    isLoadingVoices: false,
    isGenerating: false,
    currentJobId: null,
    currentJobStatus: null,
    audioUrl: null,
    error: null
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load voices when component mounts
  useEffect(() => {
    fetchVoices();
    fetchVoicePresets(defaultLanguage);
    
    // Create audio element
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio();
    }
    
    // Cleanup polling and audio on unmount
    return () => {
      if (pollingTimerRef.current) {
        clearTimeout(pollingTimerRef.current);
      }
      
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [defaultLanguage]);

  // Fetch voices
  const fetchVoices = useCallback(async (language?: string, gender?: string, accent?: string) => {
    try {
      setState(prev => ({ ...prev, isLoadingVoices: true, error: null }));
      const result = await listVoices(language, gender, accent);
      setState(prev => ({ ...prev, voices: result.voices, isLoadingVoices: false }));
    } catch (err) {
      console.error('Error fetching voices:', err);
      setState(prev => ({
        ...prev,
        isLoadingVoices: false,
        error: err instanceof Error ? err.message : 'Failed to fetch voices'
      }));
    }
  }, []);

  // Fetch voice presets for a language
  const fetchVoicePresets = useCallback(async (language: string = 'english') => {
    try {
      const presets = await listVoicePresets(language);
      setState(prev => ({ ...prev, voicePresets: presets }));
    } catch (err) {
      console.error('Error fetching voice presets:', err);
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to fetch voice presets'
      }));
    }
  }, []);

  // Generate speech
  const generateAudio = useCallback(async (request: GenerateSpeechRequest) => {
    try {
      setState(prev => ({
        ...prev,
        isGenerating: true,
        currentJobId: null,
        currentJobStatus: null,
        audioUrl: null,
        error: null
      }));

      // Start the generation job
      const jobResponse = await generateSpeech(request);

      // Set the job ID and start polling
      setState(prev => ({
        ...prev,
        currentJobId: jobResponse.job_id,
        currentJobStatus: jobResponse.status
      }));

      // Start polling for job status
      pollJobStatus(jobResponse.job_id);
    } catch (err) {
      console.error('Error generating speech:', err);
      setState(prev => ({
        ...prev,
        isGenerating: false,
        error: err instanceof Error ? err.message : 'Failed to generate speech'
      }));
    }
  }, []);

  // Poll job status
  const pollJobStatus = useCallback(async (jobId: string) => {
    try {
      const status = await checkJobStatus(jobId);
      
      setState(prev => ({
        ...prev,
        currentJobStatus: status.status,
      }));

      if (status.status === 'completed' && status.result) {
        // Job completed successfully
        const audioUrl = status.result.blob_url || 
                      (status.result.file_name ? getAudioUrl(status.result.file_name) : null);
        
        setState(prev => ({
          ...prev,
          isGenerating: false,
          audioUrl,
        }));

        // Set audio URL if available
        if (audioUrl && audioRef.current) {
          audioRef.current.src = audioUrl;
        }
      } else if (status.status === 'error') {
        // Job failed
        setState(prev => ({
          ...prev,
          isGenerating: false,
          error: status.error || 'Failed to generate speech',
        }));
      } else {
        // Job still in progress, continue polling
        pollingTimerRef.current = setTimeout(() => {
          pollJobStatus(jobId);
        }, pollingInterval);
      }
    } catch (err) {
      console.error('Error polling job status:', err);
      setState(prev => ({
        ...prev,
        isGenerating: false,
        error: err instanceof Error ? err.message : 'Failed to check job status',
      }));
    }
  }, [pollingInterval]);

  // Play audio
  const playAudio = useCallback(() => {
    if (audioRef.current && state.audioUrl) {
      audioRef.current.play().catch(err => {
        console.error('Error playing audio:', err);
      });
    }
  }, [state.audioUrl]);

  // Pause audio
  const pauseAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, []);

  // Reset state
  const reset = useCallback(() => {
    if (pollingTimerRef.current) {
      clearTimeout(pollingTimerRef.current);
    }
    
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    setState({
      voices: state.voices,
      voicePresets: state.voicePresets,
      isLoadingVoices: false,
      isGenerating: false,
      currentJobId: null,
      currentJobStatus: null,
      audioUrl: null,
      error: null
    });
  }, [state.voices, state.voicePresets]);

