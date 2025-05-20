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
            
            return {
              id: video.id,
              name,
              image: video.thumbnail_url || video.preview_image_url || '/placeholder-avatar.jpg',
              tags,
              hd: video.aspect_ratio === '16:9', // Example logic
              pro: false, // Can set based on any criteria in your system
              videoUrl: video.video_url
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