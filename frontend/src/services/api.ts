// API service for interacting with the backend

import { 
  HeygenAvatar, 
  HeygenVoice, 
  HeygenVideoGenerationRequest, 
  HeygenVideoResponse,
  DatabaseAvatarVideo
} from "@/types/heygen";
import { API_BASE_URL, HEYGEN_API } from "@/config/api";

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
  }
}; 