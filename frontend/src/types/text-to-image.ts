/**
 * Text-to-image service types
 */

export interface AvatarParameters {
  gender?: string;
  age?: string;
  ethnicity?: string;
  skin_tone?: string;
  hair_style?: string;
  hair_color?: string;
  facial_features?: string;
  expression?: string;
  style?: string;
  background?: string;
  lighting?: string;
  custom_prompt?: string;
}

export interface GenerateImageRequest {
  prompt?: string;
  params?: AvatarParameters;
  negative_prompt?: string;
  num_inference_steps?: number;
  guidance_scale?: number;
  save_image?: boolean;
  user_id?: string;
  workspace_id?: string;
}

export interface GenerateAvatarRequest {
  gender?: string;
  age?: string;
  ethnicity?: string;
  expression?: string;
  style?: string;
  custom_prompt?: string;
  user_id?: string;
  workspace_id?: string;
}

export interface UploadImageRequest {
  image_path: string;
}

export interface UploadImageResponse {
  url: string;
}

export interface ImageGenerationResponse {
  request_id: string;
  prompt: string;
  status: string;
  timestamp: number;
  image_data?: string;
  image_urls?: string[];
  image_paths?: string[];
  image_saved?: boolean;
  blob_urls?: string[]; // Frontend-specific field for displaying images
  error?: string;
} 