/**
 * Service for text-to-speech API endpoints
 */

import apiClient from '@/lib/api-client';
import { mapTextToSpeechResponse } from './api-utils';
import type {
  GenerateSpeechRequest,
  SpeechGenerationResponse,
  VoicesListResponse
} from '@/types/text-to-speech';
import type { ApiResponse } from '@/types/api';

/**
 * Generate speech from text
 */
export async function generateSpeech(request: GenerateSpeechRequest): Promise<SpeechGenerationResponse> {
  const response = await apiClient.post<SpeechGenerationResponse>('/text-to-speech/generate', request);
  return mapTextToSpeechResponse(response);
}

/**
 * Get list of available voices
 */
export async function getVoices(): Promise<VoicesListResponse> {
  const response = await apiClient.get<VoicesListResponse>('/text-to-speech/voices');
  return response.data;
} 