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
import type { ApiResponse } from '@/types/api';

/**
 * Generate an image from text prompt
 */
export async function generateImage(request: GenerateImageRequest): Promise<ImageGenerationResponse> {
  const response = await apiClient.post<ImageGenerationResponse>('/text-to-image/generate', request);
  return mapTextToImageResponse(response);
}

/**
 * Generate an avatar image
 */
export async function generateAvatar(request: GenerateAvatarRequest): Promise<ImageGenerationResponse> {
  const response = await apiClient.post<ImageGenerationResponse>('/text-to-image/avatar', request);
  return mapTextToImageResponse(response);
}

/**
 * Upload an image to the service
 */
export async function uploadImage(request: UploadImageRequest): Promise<UploadImageResponse> {
  const response = await apiClient.post<UploadImageResponse>('/text-to-image/upload', request);
  return response.data;
} 