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

