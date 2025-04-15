/**
 * API Configuration
 * 
 * This file contains all the API endpoints and base URLs for both local development and production.
 * Update the API_BASE_URL constant to switch between environments.
 */

// Base URLs for different environments
const LOCAL_API_URL = 'http://localhost:8000';
const PRODUCTION_API_URL = 'https://ai-api-growth-op-sw9m9.ondigitalocean.app';

// Set the appropriate base URL depending on environment
export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? PRODUCTION_API_URL 
  : PRODUCTION_API_URL; // Using production for both until local is set up

// HeyGen API endpoints
export const HEYGEN_API = {
  // Base endpoint for HeyGen
  BASE: `${API_BASE_URL}/api/v1/video/heygen`,
  
  // List available avatars
  AVATARS: `${API_BASE_URL}/api/v1/video/heygen/avatars`,
  
  // List available voices
  VOICES: `${API_BASE_URL}/api/v1/video/heygen/voices`,
  
  // Generate avatar video
  GENERATE_AVATAR_VIDEO: `${API_BASE_URL}/api/v1/video/heygen/generate-avatar-video`,
  
  // Check video status
  VIDEO_STATUS: (videoId: string) => `${API_BASE_URL}/api/v1/video/heygen/video/${videoId}`,
};

// Other API endpoints can be added here as the application grows
export const API = {
  HEYGEN: HEYGEN_API,
  // Add other API categories here
};

export default API; 