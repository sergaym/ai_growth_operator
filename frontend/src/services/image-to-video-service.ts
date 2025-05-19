/**
 * Service for image-to-video API endpoints
 */

import apiClient from '@/lib/api-client';
import { mapImageToVideoResponse } from './api-utils';
import type {
  GenerateVideoRequest,
  GenerateVideoFromUrlRequest,
  GenerateVideoFromBase64Request,
  VideoGenerationResponse,
  VideoJobStatus
} from '@/types/image-to-video';
import type { ApiResponse } from '@/types/api';

/**
 * Generate video from existing image ID - returns a job ID immediately
 */
export async function generateVideo(request: GenerateVideoRequest): Promise<VideoGenerationResponse> {
  const response = await apiClient.post<VideoGenerationResponse>('/image-to-video/generate', request);
  return mapImageToVideoResponse(response);
}

/**
 * Generate video from image URL - returns a job ID immediately
 */
export async function generateVideoFromUrl(request: GenerateVideoFromUrlRequest): Promise<VideoGenerationResponse> {
  const response = await apiClient.post<VideoGenerationResponse>('/image-to-video/generate-from-url', request);
  return mapImageToVideoResponse(response);
}

/**
 * Generate video from base64 image - returns a job ID immediately
 */
export async function generateVideoFromBase64(request: GenerateVideoFromBase64Request): Promise<VideoGenerationResponse> {
  const response = await apiClient.post<VideoGenerationResponse>('/image-to-video/generate-from-base64', request);
  return mapImageToVideoResponse(response);
}

/**
 * Get the status of a video generation job
 */
export async function getVideoJobStatus(jobId: string): Promise<VideoJobStatus> {
  const response = await apiClient.get<VideoJobStatus>(`/image-to-video/status/${jobId}`);
  return response.data;
} 