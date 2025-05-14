/**
 * Lipsync service types
 */

export interface LipsyncRequest {
  // Backend schema fields
  video_path?: string;
  video_url?: string;
  audio_path?: string;
  audio_url?: string;
  save_result?: boolean;
  
  // Frontend-specific fields
  video_id?: string;
  audio_id?: string;
  user_id?: string;
  workspace_id?: string;
}

export interface LipsyncResponse {
  // Backend schema fields
  request_id: string;
  status: string;
  timestamp: number;
  output_video_url?: string;
  output_video_path?: string;
  local_video_url?: string;
  input: Record<string, any>;
  error?: string;
  
  // Frontend-specific fields
  video_url?: string; // Mapped from output_video_url
  local_path?: string; // Mapped from output_video_path
  blob_url?: string; // Mapped from output_video_url
  duration?: string;
} 