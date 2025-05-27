"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { apiClient } from '../services/apiClient';

// Project interfaces matching the backend schemas
export interface ProjectAssetSummary {
  total_videos: number;
  total_audio: number;
  total_images: number; // Keep for compatibility but will always be 0 for projects
  total_lipsync_videos: number;
  latest_asset_created_at?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  workspace_id: string;
  created_by_user_id: string;
  status: 'draft' | 'in_progress' | 'completed' | 'archived';
  thumbnail_url?: string;
  created_at: string;
  updated_at: string;
  last_activity_at: string;
  asset_summary?: ProjectAssetSummary;
  metadata?: Record<string, any>;
}

export interface ProjectCreateRequest {
  name: string;
  description?: string;
  thumbnail_url?: string;
  metadata?: Record<string, any>;
}

export interface ProjectUpdateRequest {
  name?: string;
  description?: string;
  status?: 'draft' | 'in_progress' | 'completed' | 'archived';
  thumbnail_url?: string;
  metadata?: Record<string, any>;
}

export interface ProjectListResponse {
  projects: Project[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

