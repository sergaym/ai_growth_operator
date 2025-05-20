/**
 * Text-to-speech service types
 */

export interface VoiceSettings {
  stability: number;
  similarity_boost: number;
  style?: number;
  use_speaker_boost?: boolean;
}

export interface Voice {
  voice_id: string;
  name: string;
  description?: string;
  preview_url?: string;
  languages: string[];
  gender?: string;
  age?: string;
  accent?: string;
  is_cloned: boolean;
  category?: string;
  default_settings?: VoiceSettings;
  labels?: Record<string, string>;
}

export interface VoicesListResponse {
  voices: Voice[];
}

export interface GenerateSpeechRequest {
  text: string;
  voice_id?: string;
  voice_preset?: string;
  language?: string;
  model_id?: string;
  voice_settings?: VoiceSettings;
  output_format?: string;
  user_id?: string;
  workspace_id?: string;
}

export interface SpeechGenerationResponse {
  audio_url?: string;
  blob_url?: string;
  status: string;
  error?: string;
  request_id: string;
  file_name?: string;
}

export interface JobStatusResponse {
  job_id: string;
  status: "pending" | "processing" | "completed" | "error";
  created_at: number;
  updated_at: number;
  message?: string;
  result?: SpeechGenerationResponse;
  error?: string;
} 