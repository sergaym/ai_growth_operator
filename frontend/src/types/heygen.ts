// HeyGen API types for avatar videos

export interface HeygenAvatar {
  avatar_id: string;
  avatar_name: string;
  gender: string;
  preview_image_url?: string;
  preview_video_url?: string;
}

export interface HeygenVoice {
  voice_id: string;
  language: string;
  gender: string;
  name: string;
  preview_audio?: string;
  emotion_support?: boolean;
  support_interactive_avatar?: boolean;
}

export interface HeygenVideoGenerationRequest {
  prompt: string;
  avatar_id: string;
  voice_id: string;
  background_color?: string;
  width?: number;
  height?: number;
  voice_speed?: number;
  voice_pitch?: number;
  avatar_style?: string;
}

export interface HeygenVideoResponse {
  video_id: string;
  status: "pending" | "processing" | "completed" | "failed";
  video_url?: string;
  thumbnail_url?: string;
  duration?: number;
  error?: {
    code?: string;
    message?: string;
    detail?: string;
  };
}

// Database avatar video response from backend
export interface DatabaseAvatarVideo {
  id: number;
  generation_id: string;
  status: string;
  prompt: string;
  avatar_id: string;
  avatar_name?: string;
  avatar_style: string;
  voice_id: string;
  voice_speed: number;
  voice_pitch: number;
  video_url?: string;
  thumbnail_url?: string;
  duration?: string;
  created_at: string;
  completed_at?: string;
  processing_time?: number;
}

// Frontend tracked video generation
export interface TrackedVideoGeneration {
  id: string; // This will be the video_id
  prompt: string;
  avatarId: string;
  voiceId: string;
  avatarName?: string;
  voiceName?: string;
  status: "pending" | "processing" | "completed" | "failed";
  createdAt: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  error?: string;
} 