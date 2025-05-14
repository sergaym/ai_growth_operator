/**
 * Service for image-to-video API endpoints
 */

import apiClient from '@/lib/api-client';
import { mapImageToVideoResponse } from './api-utils';
import type {
  GenerateVideoRequest,
  GenerateVideoFromUrlRequest,
  GenerateVideoFromBase64Request,
  VideoGenerationResponse
} from '@/types/image-to-video';
import type { ApiResponse } from '@/types/api';

/**
 * Generate video from existing image ID
 */
export async function generateVideo(request: GenerateVideoRequest): Promise<VideoGenerationResponse> {
  const response = await apiClient.post<VideoGenerationResponse>('/image-to-video/generate', request);
  return mapImageToVideoResponse(response);
}

/**
 * Generate video from image URL
 */
export async function generateVideoFromUrl(request: GenerateVideoFromUrlRequest): Promise<VideoGenerationResponse> {
  const response = await apiClient.post<VideoGenerationResponse>('/image-to-video/generate-from-url', request);
  return mapImageToVideoResponse(response);
}

/**
 * Generate video from base64 image
 */
export async function generateVideoFromBase64(request: GenerateVideoFromBase64Request): Promise<VideoGenerationResponse> {
  const response = await apiClient.post<VideoGenerationResponse>('/image-to-video/generate-from-base64', request);
  return mapImageToVideoResponse(response);
} 