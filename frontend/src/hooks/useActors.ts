import { useState, useEffect } from 'react';
import apiClient from '@/lib/api-client';

export interface Actor {
  id: string;
  name: string;
  image: string;
  tags: string[];
  hd?: boolean;
  pro?: boolean;
  videoUrl?: string;
}

interface VideoResponse {
  id: string;
  prompt?: string;
  duration?: string;
  aspect_ratio?: string;
  video_url?: string;
  blob_url?: string;
  local_url?: string;
  thumbnail_url?: string;
  preview_image_url?: string; 
  status: string;
  created_at?: string;
  updated_at?: string;
}

interface VideoListResponse {
  items: VideoResponse[];
  total: number;
  skip: number;
  limit: number;
}

interface UseActorsOptions {
  limit?: number;
  status?: string;
  sortBy?: string;
  sortOrder?: string;
}

// Helper to create proper URLs for videos
function getVideoUrl(video: VideoResponse): string | undefined {
 
  // Function to validate a URL is properly formed
  const isValidUrl = (url: string): boolean => {
    try {
      // Check if it's a well-formed URL
      new URL(url);
      return true;
    } catch (e) {
      // URL constructor throws if the URL is invalid
      return false;
    }
  };
  
  // Try blob URL first (external storage)
  if (video.blob_url && isValidUrl(video.blob_url)) {
    return video.blob_url;
  }
  
  // Then video_url (could be external or relative)
  if (video.video_url) {
    // Skip file:// URLs as they won't work in the browser due to security restrictions
    if (video.video_url.startsWith('file://')) {
      console.log('Skipping file:// URL:', video.video_url);
      
      // Try to extract filename from file:// URL to use with the videos endpoint
      const match = video.video_url.match(/\/videos\/([^/]+)$/);
      if (match && match[1]) {
        const filename = match[1];
        const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:80';
        console.log('Extracted filename:', filename);
        console.log('Using videos endpoint instead');
        return `${apiBase}/api/v1/image-to-video/videos/${filename}`;
      }
      
      return undefined;
    }
    
    // Check if it's a full URL or a relative path
    if (video.video_url.startsWith('http') && isValidUrl(video.video_url)) {
      return video.video_url;
    } else {
      // For relative paths, we need to construct the proper URL
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:80';
      // Check if it's a path to a video file
      if (video.video_url.includes('/videos/')) {
        // Extract just the filename for use with the videos endpoint
        const parts = video.video_url.split('/');
        const filename = parts[parts.length - 1];
        return `${apiBase}/api/v1/image-to-video/videos/${filename}`;
      }
      const fullUrl = `${apiBase}/api/v1/image-to-video${video.video_url}`;
      return isValidUrl(fullUrl) ? fullUrl : undefined;
    }
  }
  
  // Finally try local_url
  if (video.local_url) {
    // Skip file:// URLs as they won't work in the browser
    if (video.local_url.startsWith('file://')) {
      console.log('Skipping file:// URL:', video.local_url);
      
      // Try to extract filename from file:// URL to use with the videos endpoint
      const match = video.local_url.match(/\/videos\/([^/]+)$/);
      if (match && match[1]) {
        const filename = match[1];
        const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:80';
        console.log('Extracted filename:', filename);
        console.log('Using videos endpoint instead');
        return `${apiBase}/api/v1/image-to-video/videos/${filename}`;
      }
      
      return undefined;
    }
    
    // Local URLs are typically relative paths
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:80';
    
    // Check if it's a path to a video file
    if (video.local_url.includes('/videos/')) {
      // Extract just the filename for use with the videos endpoint
      const parts = video.local_url.split('/');
      const filename = parts[parts.length - 1];
      return `${apiBase}/api/v1/image-to-video/videos/${filename}`;
    }
    
    const fullUrl = `${apiBase}/api/v1/image-to-video${video.local_url}`;
    return isValidUrl(fullUrl) ? fullUrl : undefined;
  }
  
  return undefined;
}

export function useActors(options: UseActorsOptions = {}) {
  const [actors, setActors] = useState<Actor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { 
    limit = 50, 
    status = 'completed',
    sortBy = 'created_at',
    sortOrder = 'desc'
  } = options;

  useEffect(() => {
    const fetchActors = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // The endpoint path should not include /api/v1 as that's added by the apiClient
        const response = await apiClient.get<VideoListResponse>(
          '/image-to-video/videos', 
          { 
            params: {
              limit: String(limit),
              status,
              sort_by: sortBy,
              sort_order: sortOrder
            }
          }
        );
        

        if (response.data && response.data.items) {
          // Transform video data into actor format
          const actorsFromVideos = response.data.items.map((video: VideoResponse) => {
            // Extract tags from prompt (simplified example)
            const tags: string[] = [];
            if (video.prompt) {
              const promptLower = video.prompt.toLowerCase();
              if (promptLower.includes('male')) tags.push('male');
              else if (promptLower.includes('female')) tags.push('female');
              
              if (promptLower.includes('young')) tags.push('young');
              else if (promptLower.includes('adult')) tags.push('adult');
              else if (promptLower.includes('kid')) tags.push('kid');
            }

            // If no gender found in prompt, assign based on some heuristic or randomly
            if (!tags.some(tag => tag === 'male' || tag === 'female')) {
              tags.push(Math.random() > 0.5 ? 'male' : 'female');
            }
            
            // If no age found in prompt, default to adult
            if (!tags.some(tag => ['young', 'adult', 'kid'].includes(tag))) {
              tags.push('adult');
            }
            
            // Extract a name from the id or use part of the prompt as a name
            let name = '';
            if (video.prompt) {
              // Use first few words of prompt as a name
              const words = video.prompt.split(' ');
              name = words.slice(0, 2).join(' ');
              // Capitalize first letter
              name = name.charAt(0).toUpperCase() + name.slice(1);
            } else {
              // Use id as a fallback
              name = `Actor ${video.id.substring(0, 5)}`;
            }
            
            // Use blob_url first, then fall back to video_url for the video source
            const videoUrl = getVideoUrl(video);
            
            // For debugging
            if (videoUrl) {
              console.log(`Video ${video.id} has URL: ${videoUrl}`);
            }
            
            return {
              id: video.id,
              name,
              image: video.thumbnail_url || video.preview_image_url || '/placeholder-avatar.jpg',
              tags,
              hd: video.aspect_ratio === '16:9', // Example logic
              pro: false, // Can set based on any criteria in your system
              videoUrl
            };
          });
          
          setActors(actorsFromVideos);
        }
      } catch (err: any) {
        console.error('Error fetching actors:', err);
        setError(err.message || 'Failed to fetch actors');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchActors();
  }, [limit, status, sortBy, sortOrder]);
  
  return { actors, isLoading, error };
} 