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
      console.log(`Starting polling for video ${generation.id} in AvatarVideoCard`);
      startPolling();
    }
  }, [generation.status, generation.id, isPolling, startPolling]);
  
  // Update parent when status changes
  useEffect(() => {
    if (videoStatus && (
      videoStatus.status !== generation.status ||
      videoStatus.video_url !== generation.videoUrl
    )) {
      console.log(`Updating video ${generation.id} status to ${videoStatus.status}`);
      onUpdate({
        ...generation,
        status: videoStatus.status,
        videoUrl: videoStatus.video_url,
        thumbnailUrl: videoStatus.thumbnail_url,
        error: videoStatus.error?.message
      });
    }
  }, [videoStatus, generation, onUpdate]);

  // Format for display
  const formattedDate = new Date(generation.createdAt).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
  
  // Helper function to get the correct status styles
  const getStatusStyles = (status: string) => {
    switch(status) {
      case 'completed':
        return 'bg-[#e8f5e9] text-[#28a745] border border-[#c8e6c9]';
      case 'pending':
      case 'processing':
        return 'bg-[#e3f2fd] text-[#0d6efd] border border-[#bbdefb]';
      default:
        return 'bg-[#ffebee] text-[#dc3545] border border-[#ffcdd2]';
    }
  };
  
  // Handle video errors or missing URL for completed videos
  const hasVideoError = generation.status === 'completed' && !generation.videoUrl;
  
  return (
    <div className="w-full">
      <div className="aspect-video relative mb-3 overflow-hidden rounded-md border border-[#e6e6e6]">
        {generation.status === "completed" && generation.videoUrl ? (
          <video
            src={generation.videoUrl}
            className="absolute inset-0 w-full h-full object-cover"
            controls
            poster={generation.thumbnailUrl}
            onError={(e) => console.error(`Error loading video ${generation.id}:`, e)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-[#f9f9f9]">
            {generation.status === "pending" || generation.status === "processing" ? (
              <div className="flex flex-col items-center">
                <div className="animate-spin h-8 w-8 border-2 border-[#e6e6e6] border-t-[#37352f] rounded-full mb-3"></div>
                <span className="text-sm text-[#6b7280]">
                  {generation.status === "pending" ? "Starting..." : "Processing..."}
                </span>
              </div>
            ) : (
              <div className="text-[#e03e21] text-center p-4">
                <p className="font-medium">Generation failed</p>
                {generation.error && (
                  <div className="text-sm mt-2 bg-[#ffebee] p-2 rounded-md border border-[#ffcdd2]">{generation.error}</div>
                )}
                {hasVideoError && !generation.error && (
                  <div className="text-sm mt-2 bg-[#ffebee] p-2 rounded-md border border-[#ffcdd2]">
                    Video URL not available
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="px-1 py-1">
        <div className="flex items-center justify-between mb-2">
          <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${getStatusStyles(generation.status)}`}>
            {generation.status.charAt(0).toUpperCase() + generation.status.slice(1)}
          </span>
          <span className="text-[#9c9c9c] text-xs">{formattedDate}</span>
        </div>
        
        <p className="text-sm text-[#37352f] line-clamp-2 mb-3">{generation.prompt}</p>
        
        {(generation.avatarName || generation.voiceName) && (
          <div className="text-xs text-[#6b7280] flex flex-wrap gap-1.5">
            {generation.avatarName && (
              <span className="bg-[#f1f1f1] px-1.5 py-0.5 rounded-sm">
                {generation.avatarName}
              </span>
            )}
            {generation.voiceName && (
              <span className="bg-[#f1f1f1] px-1.5 py-0.5 rounded-sm">
                {generation.voiceName}
              </span>
            )}
          </div>
        )}
        
        {error && (
          <div className="mt-2 text-xs text-[#e03e21] p-2 bg-[#ffebee] rounded-md border border-[#ffcdd2]">
            Error checking status: {error}
          </div>
        )}
      </div>
    </div>
  );
} 