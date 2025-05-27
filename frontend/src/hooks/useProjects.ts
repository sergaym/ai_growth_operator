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
