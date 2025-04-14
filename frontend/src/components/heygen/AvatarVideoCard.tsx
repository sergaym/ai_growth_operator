import React, { useEffect } from 'react';
import { useHeygenVideoStatus } from '@/hooks/useHeygenApi';
import { TrackedVideoGeneration } from '@/types/heygen';

interface AvatarVideoCardProps {
  generation: TrackedVideoGeneration;
  onUpdate: (updatedGeneration: TrackedVideoGeneration) => void;
}

export default function AvatarVideoCard({ generation, onUpdate }: AvatarVideoCardProps) {
  // Use the hook to poll for status updates
  const { 
    videoStatus, 
    error,
    startPolling, 
    isPolling 
  } = useHeygenVideoStatus(generation.id);
  
  // Start polling when component mounts if status is not completed or failed
  useEffect(() => {
    if (generation.status !== 'completed' && generation.status !== 'failed' && !isPolling) {
      startPolling();
    }
  }, [generation.status, isPolling, startPolling]);
  
  // Update parent when status changes
  useEffect(() => {
    if (videoStatus && (
      videoStatus.status !== generation.status ||
      videoStatus.video_url !== generation.videoUrl
    )) {
      onUpdate({
        ...generation,
        status: videoStatus.status,
        videoUrl: videoStatus.video_url,
        thumbnailUrl: videoStatus.thumbnail_url,
        error: videoStatus.error?.message
      });
    }
  }, [videoStatus, generation, onUpdate]);

