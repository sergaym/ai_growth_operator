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
  const formattedDate = new Date(generation.createdAt).toLocaleTimeString();
  
  // Helper function to get the correct status styles
  const getStatusStyles = (status: string) => {
    switch(status) {
      case 'completed':
        return 'bg-green-100 text-green-600 border border-green-200';
      case 'pending':
      case 'processing':
        return 'bg-blue-100 text-blue-600 border border-blue-200';
      default:
        return 'bg-red-100 text-red-600 border border-red-200';
    }
  };
  
  // Handle video errors or missing URL for completed videos
  const hasVideoError = generation.status === 'completed' && !generation.videoUrl;
  
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="aspect-video relative">
        {generation.status === "completed" && generation.videoUrl ? (
          <video
            src={generation.videoUrl}
            className="absolute inset-0 w-full h-full object-cover"
            controls
            autoPlay
            loop
            muted
            poster={generation.thumbnailUrl}
            onError={(e) => console.error(`Error loading video ${generation.id}:`, e)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
            {generation.status === "pending" || generation.status === "processing" ? (
              <div className="flex flex-col items-center">
                <svg className="animate-spin h-10 w-10 text-blue-500 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-sm text-slate-600">
                  {generation.status === "pending" ? "Starting..." : "Processing..."}
                </span>
              </div>
            ) : (
              <div className="text-red-500 text-center p-4">
                <p className="font-medium">Generation failed</p>
                {generation.error && (
                  <div className="text-sm mt-2 bg-red-50 p-2 rounded-md">{generation.error}</div>
                )}
                {hasVideoError && !generation.error && (
                  <div className="text-sm mt-2 bg-red-50 p-2 rounded-md">
                    Video URL not available
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyles(generation.status)}`}>
            {generation.status.charAt(0).toUpperCase() + generation.status.slice(1)}
          </span>
          <span className="text-slate-500 text-sm">{formattedDate}</span>
        </div>
        
        <p className="text-sm text-slate-700 line-clamp-2 mb-2">{generation.prompt}</p>
        
        {(generation.avatarName || generation.voiceName) && (
          <div className="text-xs text-slate-600 flex flex-wrap gap-2">
            {generation.avatarName && (
              <span className="bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                Avatar: {generation.avatarName}
              </span>
            )}
            {generation.voiceName && (
              <span className="bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                Voice: {generation.voiceName}
              </span>
            )}
          </div>
        )}
        
        {error && (
          <div className="mt-2 text-xs text-red-500 p-2 bg-red-50 rounded-md border border-red-100">
            Error checking status: {error}
          </div>
        )}
      </div>
    </div>
  );
} 