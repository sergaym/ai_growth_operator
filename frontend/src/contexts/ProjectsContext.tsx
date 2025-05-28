"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '../services/apiClient';

// Project interfaces
export interface ProjectAssetSummary {
  total_videos: number;
  total_audio: number;
  total_images: number;
  total_lipsync_videos: number;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  workspace_id: string;
  created_at: string;
  updated_at: string;
  last_activity_at: string;
  thumbnail_url?: string;
  asset_summary?: ProjectAssetSummary;
}

export interface ProjectCreateRequest {
  name: string;
  description?: string;
  status?: string;
}

export interface ProjectUpdateRequest {
  name?: string;
  description?: string;
  status?: string;
}

export interface ProjectAsset {
  id: string;
  project_id: string;
  type: string;
  filename: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}

export interface ProjectAssetsResponse {
  assets: ProjectAsset[];
  total: number;
}

export interface ProjectStats {
  total_projects: number;
  active_projects: number;
  completed_projects: number;
  total_assets: number;
}
