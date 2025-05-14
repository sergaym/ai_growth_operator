/**
 * Service for text-to-image API endpoints
 */

import apiClient from '@/lib/api-client';
import { mapTextToImageResponse } from './api-utils';
import type { 
  GenerateImageRequest,
  GenerateAvatarRequest,
  UploadImageRequest,
  UploadImageResponse,
  ImageGenerationResponse
} from '@/types/text-to-image';
import type { ApiResponse, AsyncApiResponse } from '@/types/api';

/**
 * Generate an image from text prompt
 */
export async function generateImage(request: GenerateImageRequest): Promise<ImageGenerationResponse> {
  try {
    // Ensure upload_to_blob is set to true for the frontend
    const requestWithBlob = {
      ...request,
      upload_to_blob: true
    };
    
    const response = await apiClient.post<ImageGenerationResponse>('/text-to-image/generate', requestWithBlob);
    return mapTextToImageResponse(response);
  } catch (error) {
    console.error('Error generating image:', error);
    // Create error response that's compatible with ImageGenerationResponse
    return {
      request_id: 'error-' + Date.now(),
      prompt: request.prompt || 'Unknown prompt',
      status: 'failed',
      timestamp: Date.now(),
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Generate an avatar image
 */
export async function generateAvatar(request: GenerateAvatarRequest): Promise<ImageGenerationResponse> {
  try {
    // Ensure upload_to_blob is set to true for the frontend
    const requestWithBlob = {
      ...request,
      upload_to_blob: true
    };
    
    const response = await apiClient.post<ImageGenerationResponse>('/text-to-image/avatar', requestWithBlob);
    return mapTextToImageResponse(response);
  } catch (error) {
    console.error('Error generating avatar:', error);
    // Create error response that's compatible with ImageGenerationResponse
    return {
      request_id: 'error-' + Date.now(),
      prompt: request.custom_prompt || 'Avatar generation',
      status: 'failed',
      timestamp: Date.now(),
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Upload an image to the service
 */
export async function uploadImage(request: UploadImageRequest): Promise<UploadImageResponse> {
  const response = await apiClient.post<UploadImageResponse>('/text-to-image/upload', request);
  return response.data;
} 