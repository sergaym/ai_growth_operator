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
