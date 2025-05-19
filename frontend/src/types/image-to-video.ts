/**
 * Image-to-video service types
 */

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

export interface VideoJobStatus {
  job_id: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  created_at?: number;
  updated_at?: number;
  result?: {
    video_url?: string;
    preview_image_url?: string;
    [key: string]: any;
  };
  error?: string;
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