/**
 * API utility functions for mapping API responses
 */

import type { ImageGenerationResponse } from '@/types/text-to-image';
import type { SpeechGenerationResponse } from '@/types/text-to-speech';
import type { VideoGenerationResponse } from '@/types/image-to-video';
import type { LipsyncResponse, LipsyncRequest } from '@/types/lipsync';
import type { ApiResponse } from '@/types/api';

/**
 * Maps text-to-image response fields for compatibility with frontend
 */
export function mapTextToImageResponse(response: ApiResponse<ImageGenerationResponse>): ImageGenerationResponse {
  const data = response.data;
  
  // Add blob_urls for frontend if not present but image_urls exists
  if (data && !data.blob_urls && data.image_urls) {
    data.blob_urls = data.image_urls;
  }
  
  return data;
}

/**
 * Maps text-to-speech response fields for compatibility with frontend
 */
export function mapTextToSpeechResponse(response: any): SpeechGenerationResponse {
  // Handle both ApiResponse objects and raw data objects
  const data = response.data ? response.data : response;
  
  // Add default status field for frontend components that might expect it
  if (!data.status) {
    data.status = 'completed';
  }
  
  // Map audio_url to blob_url for frontend components
  if (data.audio_url && !data.blob_url) {
    data.blob_url = data.audio_url;
  }
  
  return data;
}

/**
 * Maps image-to-video response fields for compatibility with frontend
 */
export function mapImageToVideoResponse(response: ApiResponse<VideoGenerationResponse>): VideoGenerationResponse {
  const data = response.data;
  
  // Map fields for backward compatibility
  if (data && data.video_url && !data.blob_url) {
    data.blob_url = data.video_url;
  }
  
  if (data && data.video_path && !data.local_path) {
    data.local_path = data.video_path;
  }
  
  return data;
}

/**
 * Maps lipsync response fields for compatibility with frontend
 */
export function mapLipsyncResponse(response: ApiResponse<LipsyncResponse>): LipsyncResponse {
  const data = response.data;
  
  // Map backend fields to frontend fields
  if (data) {
    if (data.output_video_url) {
      data.video_url = data.output_video_url;
      data.blob_url = data.output_video_url;
    }
    
    if (data.output_video_path) {
      data.local_path = data.output_video_path;
    }
  }
  
  return data;
}

/**
 * Prepares lipsync request by mapping frontend fields to backend fields
 */
export function prepareLipsyncRequest(request: LipsyncRequest): Record<string, any> {
  const backendRequest: Record<string, any> = { ...request };
  
  // If using IDs, translate them to URLs if available
  if (backendRequest.video_id && !backendRequest.video_url && !backendRequest.video_path) {
    delete backendRequest.video_id;
  }
  
  if (backendRequest.audio_id && !backendRequest.audio_url && !backendRequest.audio_path) {
    delete backendRequest.audio_id;
  }
  
  // Remove frontend-specific fields
  delete backendRequest.user_id;
  delete backendRequest.workspace_id;
  
  return backendRequest;
} 