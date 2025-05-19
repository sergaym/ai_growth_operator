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