/**
 * Service for text-to-speech API endpoints
 */

import apiClient from '@/lib/api-client';
import { mapTextToSpeechResponse } from './api-utils';
import type {
  GenerateSpeechRequest,
  SpeechGenerationResponse,
  VoicesListResponse,
  JobStatusResponse
} from '@/types/text-to-speech';
import type { ApiResponse, AsyncApiResponse } from '@/types/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Fetches all available voices for text-to-speech
 */
export async function listVoices(
  filterByLanguage?: string,
  filterByGender?: string,
  filterByAccent?: string
): Promise<VoicesListResponse> {
  // Build query params
  const params = new URLSearchParams();
  if (filterByLanguage) params.append('filter_by_language', filterByLanguage);
  if (filterByGender) params.append('filter_by_gender', filterByGender);
  if (filterByAccent) params.append('filter_by_accent', filterByAccent);

  const query = params.toString() ? `?${params.toString()}` : '';
  
  const response = await fetch(`${API_URL}/api/v1/text-to-speech/voices${query}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `Failed to fetch voices: ${response.status}`);
  }

  return await response.json();
}

/**
 * Fetches voice presets for a specific language
 */
export async function listVoicePresets(language: string = 'english'): Promise<Record<string, string>> {
  const response = await fetch(`${API_URL}/api/v1/text-to-speech/voices/presets?language=${language}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `Failed to fetch voice presets: ${response.status}`);
  }

  return await response.json();
}

/**
 * Generates speech from text (initiates the job)
 */
export async function generateSpeech(request: GenerateSpeechRequest): Promise<JobStatusResponse> {
  const response = await fetch(`${API_URL}/api/v1/text-to-speech/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `Failed to generate speech: ${response.status}`);
  }

  return await response.json();
}

/**
 * Checks the status of a speech generation job
 */
export async function checkJobStatus(jobId: string): Promise<JobStatusResponse> {
  const response = await fetch(`${API_URL}/api/v1/text-to-speech/status/${jobId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `Failed to check job status: ${response.status}`);
  }

  return await response.json();
}

/**
 * Gets the full audio URL for a filename
 */
export function getAudioUrl(filename: string): string {
  return `${API_URL}/api/v1/text-to-speech/audio/${filename}`;
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