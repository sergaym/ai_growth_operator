/**
 * Text-to-speech service types
 */

export interface VoiceSettings {
  stability?: number;
  similarity_boost?: number;
  style?: number;
  use_speaker_boost?: boolean;
}

export interface GenerateSpeechRequest {
  text: string;
  voice_id?: string;
  voice_preset?: string;
  language?: string;
  model_id?: string;
  voice_settings?: VoiceSettings;
  user_id?: string;
  workspace_id?: string;
}

export interface SpeechGenerationResponse {
  audio_url: string;
  duration_seconds?: number;
  text: string;
  voice_id: string;
  voice_name?: string;
  model_id: string;
  
  // Frontend-specific fields for backward compatibility
  request_id?: string;
  blob_url?: string;
  local_path?: string;
  status?: string;
  error?: string;
  format?: string;
}

export interface VoiceResponse {
  voice_id: string;
  name: string;
  description?: string;
  preview_url?: string;
  languages: string[];
  gender?: string;
  age?: string;
  accent?: string;
  is_cloned: boolean;
}

export interface VoicesListResponse {
  voices: VoiceResponse[];
} 