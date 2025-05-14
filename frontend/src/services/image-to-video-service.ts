/**
 * Service for image-to-video API endpoints
 */

import apiClient, { ApiResponse } from '@/lib/api-client';
import { mapImageToVideoResponse } from './api';

export interface VideoGenerationParameters {
  duration: string;
  aspect_ratio: string;
  cfg_scale: number;
  negative_prompt?: string;
}

export interface GenerateVideoRequest {
  image_url?: string;
  image_base64?: string;
  source_image_id?: string; // Frontend-specific field
  prompt: string;
  duration?: string;
  aspect_ratio?: string;
  negative_prompt?: string;
  cfg_scale?: number;
  save_video?: boolean;
  user_id?: string;
  workspace_id?: string;
}

export interface GenerateVideoFromUrlRequest {
  image_url: string;
  prompt: string;
  duration?: string;
  aspect_ratio?: string;
  negative_prompt?: string;
  cfg_scale?: number;
  user_id?: string;
  workspace_id?: string;
}

export interface GenerateVideoFromBase64Request {
  image_base64: string;
  prompt: string;
  duration?: string;
  aspect_ratio?: string;
  negative_prompt?: string;
  cfg_scale?: number;
  user_id?: string;
  workspace_id?: string;
}

export interface VideoGenerationResponse {
  request_id: string;
  prompt: string;
  status: string;
  timestamp: number;
  parameters: VideoGenerationParameters;
  video_url?: string;
  video_path?: string;
  preview_image_url?: string;
  error?: string;
  
  // Frontend-specific fields for backward compatibility
  local_path?: string;
  blob_url?: string;
}

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