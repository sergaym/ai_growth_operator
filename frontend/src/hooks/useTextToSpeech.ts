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

