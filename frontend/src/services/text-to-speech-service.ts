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
import type { ApiResponse, AsyncApiResponse } from '@/types/api';

/**
 * Generate speech from text
 */
export async function generateSpeech(request: GenerateSpeechRequest): Promise<AsyncApiResponse<string>> {
  const response = await apiClient.post<any>('/text-to-speech/generate', request);
  const jobId = response.data?.job_id;
  
  if (!jobId) {
    throw new Error('No job ID returned from the API');
  }
  
  return {
    success: true,
    data: jobId,
    message: response.data?.message || 'Speech generation started'
  };
}

/**
 * Check the status of a speech generation job
 */
export async function getSpeechGenerationStatus(jobId: string): Promise<AsyncApiResponse<SpeechGenerationResponse>> {
  const response = await apiClient.get<any>(`/text-to-speech/status/${jobId}`);
  
  if (response.data?.status === 'completed' && response.data?.result) {
    return {
      success: true,
      data: mapTextToSpeechResponse(response.data.result),
      message: 'Speech generation completed'
    };
  } else if (response.data?.status === 'error') {
    return {
      success: false,
      error: response.data?.error || 'Error generating speech',
      message: 'Speech generation failed'
    };
  } else {
    return {
      success: true,
      pending: true,
      message: `Speech generation in progress (${response.data?.status || 'unknown'})`
    };
  }
}

/**
 * Get list of available voices
 */
export async function getVoices(): Promise<VoicesListResponse> {
  const response = await apiClient.get<VoicesListResponse>('/text-to-speech/voices');
  return response.data;
} 