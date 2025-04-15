// API service for interacting with the backend

import { 
  HeygenAvatar, 
  HeygenVoice, 
  HeygenVideoGenerationRequest, 
  HeygenVideoResponse 
} from "@/types/heygen";

// Base URL that we can easily change for production
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// Helper function for making API requests
async function fetchFromAPI<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });
  
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `API Error: ${response.status} - ${response.statusText}`);
    }
  
    return response.json();
  } catch (error) {
    // Enhanced error handling for network issues
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new Error(`Unable to connect to the API at ${API_BASE_URL}. Please ensure the backend server is running.`);
    }
    
    // Handle other fetch errors
    if (error instanceof Error) {
      console.error(`API request failed for endpoint ${endpoint}:`, error);
      throw error;
    }
    
    throw new Error(`Unknown error during API request to ${endpoint}`);
  }
}

// HeyGen API functions
export const heygenAPI = {
  // List available avatars
  listAvatars: async (): Promise<HeygenAvatar[]> => {
    try {
      return await fetchFromAPI<HeygenAvatar[]>('/v1/video/heygen/avatars');
    } catch (error) {
      console.error('Failed to fetch avatars:', error);
      throw error;
    }
  },
  
  // List available voices
  listVoices: async (): Promise<HeygenVoice[]> => {
    try {
      return await fetchFromAPI<HeygenVoice[]>('/v1/video/heygen/voices');
    } catch (error) {
      console.error('Failed to fetch voices:', error);
      throw error;
    }
  },
  
  // Generate avatar video
  generateVideo: async (data: HeygenVideoGenerationRequest): Promise<HeygenVideoResponse> => {
    try {
      return await fetchFromAPI<HeygenVideoResponse>('/v1/video/heygen/generate-avatar-video', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('Failed to generate video:', error);
      throw error;
    }
  },
  
  // Check video status
  checkVideoStatus: async (videoId: string): Promise<HeygenVideoResponse> => {
    try {
      return await fetchFromAPI<HeygenVideoResponse>(`/v1/video/heygen/status/${videoId}`);
    } catch (error) {
      console.error(`Failed to check status for video ${videoId}:`, error);
      throw error;
    }
  }
}; 