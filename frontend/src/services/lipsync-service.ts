/**
 * Service for lipsync API endpoints
 */

import apiClient from '@/lib/api-client';
import { mapLipsyncResponse, prepareLipsyncRequest } from './api-utils';
import type { LipsyncRequest, LipsyncResponse } from '@/types/lipsync';
import type { ApiResponse } from '@/types/api';

/**
 * Generate a lipsync video by combining video and audio
 */
export async function generateLipsync(request: LipsyncRequest): Promise<LipsyncResponse> {
  // Map frontend-specific fields to backend fields if needed
  const backendRequest = prepareLipsyncRequest(request);
  
  const response = await apiClient.post<LipsyncResponse>('/lipsync/generate', backendRequest);
  return mapLipsyncResponse(response);
} 