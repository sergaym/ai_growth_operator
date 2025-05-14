// API service for interacting with the backend

import { 
  HeygenAvatar, 
  HeygenVoice, 
  HeygenVideoGenerationRequest, 
  HeygenVideoResponse,
  DatabaseAvatarVideo
} from "@/types/heygen";
import { API_BASE_URL, HEYGEN_API } from "@/config/api";
import type { ImageGenerationResponse } from '@/types/text-to-image';
import type { SpeechGenerationResponse } from '@/types/text-to-speech';
import type { VideoGenerationResponse } from '@/types/image-to-video';
import type { LipsyncResponse, LipsyncRequest } from '@/types/lipsync';
import type { ApiResponse } from '@/types/api';

/**
 * Helper function for making API requests
 * @param url - The complete API URL
 * @param options - Fetch API options
 * @returns The parsed JSON response
 */
async function fetchFromAPI<T>(
  url: string, 
  options: RequestInit = {}
): Promise<T> {
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };
  
  try {
    console.log(`Calling API: ${url}`, options);
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });
  
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.detail || `API Error: ${response.status} - ${response.statusText}`;
      console.error(`API error for ${url}:`, errorMessage);
      throw new Error(errorMessage);
    }
    
    const responseData = await response.json();
    console.log(`API response from ${url}:`, responseData);
    return responseData;
  } catch (error) {
    // Enhanced error handling for network issues
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      console.error(`Network error for ${url}:`, error);
      throw new Error(`Unable to connect to the API at ${API_BASE_URL}. Please check your internet connection and ensure the API is available.`);
    }
    
    // Handle other fetch errors
    if (error instanceof Error) {
      console.error(`API request failed for URL ${url}:`, error);
      throw error;
    }
    
    throw new Error(`Unknown error during API request to ${url}`);
  }
}

/**
 * HeyGen API client for interacting with the HeyGen avatar video generation services
 */
export const heygenAPI = {
  // List available avatars
  listAvatars: async (): Promise<HeygenAvatar[]> => {
    try {
      return await fetchFromAPI<HeygenAvatar[]>(HEYGEN_API.AVATARS);
    } catch (error) {
      console.error('Failed to fetch avatars:', error);
      throw error;
    }
  },
  
  // List available voices
  listVoices: async (): Promise<HeygenVoice[]> => {
    try {
      return await fetchFromAPI<HeygenVoice[]>(HEYGEN_API.VOICES);
    } catch (error) {
      console.error('Failed to fetch voices:', error);
      throw error;
    }
  },
  
  // Generate avatar video
  generateVideo: async (data: HeygenVideoGenerationRequest): Promise<HeygenVideoResponse> => {
    try {
      // Make sure we're sending all the expected parameters from the backend
      const requestData = {
        prompt: data.prompt,
        avatar_id: data.avatar_id,
        voice_id: data.voice_id,
        background_color: data.background_color || '#ffffff',
        width: data.width || 1280,
        height: data.height || 720,
        voice_speed: data.voice_speed || 1.0,
        voice_pitch: data.voice_pitch || 0,
        avatar_style: data.avatar_style || 'normal'
      };
      
      return await fetchFromAPI<HeygenVideoResponse>(HEYGEN_API.GENERATE_AVATAR_VIDEO, {
        method: 'POST',
        body: JSON.stringify(requestData),
      });
    } catch (error) {
      console.error('Failed to generate video:', error);
      throw error;
    }
  },
  
  // Check video status
  checkVideoStatus: async (videoId: string): Promise<HeygenVideoResponse> => {
    try {
      return await fetchFromAPI<HeygenVideoResponse>(HEYGEN_API.VIDEO_STATUS(videoId));
    } catch (error) {
      console.error(`Failed to check status for video ${videoId}:`, error);
      throw error;
    }
  },
  
  // Get all avatar videos from the database
  getAllAvatarVideos: async (): Promise<DatabaseAvatarVideo[]> => {
    try {
      return await fetchFromAPI<DatabaseAvatarVideo[]>(HEYGEN_API.AVATAR_VIDEOS);
    } catch (error) {
      console.error('Failed to fetch avatar videos from database:', error);
      throw error;
    }
  }
};

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
export function mapTextToSpeechResponse(response: ApiResponse<SpeechGenerationResponse>): SpeechGenerationResponse {
  const data = response.data;
  
  // Add default status field for frontend components that might expect it
  if (data && !data.status) {
    data.status = 'completed';
  }
  
  // Map audio_url to blob_url for frontend components
  if (data && data.audio_url && !data.blob_url) {
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