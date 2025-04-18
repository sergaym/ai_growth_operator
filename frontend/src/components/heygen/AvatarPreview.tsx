import React, { useState } from 'react';
import { HeygenAvatar, HeygenVoice } from '@/types/heygen';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, UserRound } from 'lucide-react';

interface AvatarPreviewProps {
  selectedAvatar: HeygenAvatar | undefined;
  selectedVoice: HeygenVoice | undefined;
  className?: string;
}

export default function AvatarPreview({ selectedAvatar, selectedVoice, className = '' }: AvatarPreviewProps) {
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  const [imageError, setImageError] = useState(false);

  // Play or pause the preview video
  const toggleVideoPreview = () => {
    if (!videoElement) return;
    
    if (isPlayingVideo) {
      videoElement.pause();
    } else {
      videoElement.play();
    }
    
    setIsPlayingVideo(!isPlayingVideo);
  };

  // Play or pause the voice preview
  const playVoicePreview = () => {
    if (!selectedVoice?.preview_audio || !audioElement) return;
    
    if (isPlayingAudio) {
      audioElement.pause();
      setIsPlayingAudio(false);
    } else {
      audioElement.currentTime = 0;
      audioElement.play();
      setIsPlayingAudio(true);
      
      // Automatically set to not playing when audio ends
      audioElement.onended = () => {
        setIsPlayingAudio(false);
      };
    }
  };

  // Initialize audio element when voice changes
  React.useEffect(() => {
    if (selectedVoice?.preview_audio && !audioElement) {
      const audio = new Audio(selectedVoice.preview_audio);
      setAudioElement(audio);
    }
  }, [selectedVoice, audioElement]);

  // If no avatar is selected, show a placeholder
  if (!selectedAvatar) {
    return (
      <Card className={`flex items-center justify-center h-full min-h-[320px] bg-gray-50 border border-[#e6e6e6] rounded-lg ${className}`}>
        <div className="text-center p-6">
          <UserRound className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Select an avatar to preview</p>
        </div>
      </Card>
    );
  }

  // Check if we have valid media to display
  const hasPreviewVideo = Boolean(selectedAvatar.preview_video_url);
  const hasPreviewImage = Boolean(selectedAvatar.preview_image_url) && !imageError;

  return (
    <Card className={`overflow-hidden relative h-full border-[#e6e6e6] rounded-lg ${className}`}>
      {/* Avatar Preview Image or Video */}
      <div className="relative bg-gray-50 h-[calc(100%-64px)] min-h-[260px]">
        {hasPreviewVideo ? (
          <video 
            ref={(el) => setVideoElement(el)}
            src={selectedAvatar.preview_video_url}
            className="w-full h-full object-cover object-center"
            loop
            muted
            poster={selectedAvatar.preview_image_url}
            onPlay={() => setIsPlayingVideo(true)}
            onPause={() => setIsPlayingVideo(false)}
            onError={() => setImageError(true)}
          />
        ) : hasPreviewImage ? (
          <img 
            src={selectedAvatar.preview_image_url} 
            alt={selectedAvatar.avatar_name}
            className="w-full h-full object-cover object-center"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <UserRound className="h-10 w-10 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-xs">No preview available</p>
              <p className="text-gray-400 text-xs mt-1">{selectedAvatar.avatar_name}</p>
            </div>
          </div>
        )}
        
        {/* Video controls (only shown if preview video exists) */}
        {hasPreviewVideo && (
          <div className="absolute bottom-4 left-4">
            <Button
              size="icon"
              variant="secondary"
              className="bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white rounded-full w-10 h-10"
              onClick={toggleVideoPreview}
            >
              {isPlayingVideo ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
            </Button>
          </div>
        )}
      </div>
      
      {/* Avatar Info */}
      <div className="p-4 flex items-center justify-between bg-white border-t border-[#e6e6e6]">
        <div>
          <h3 className="font-medium text-base text-[#37352f]">{selectedAvatar.avatar_name}</h3>
          <p className="text-gray-500 text-sm">{selectedAvatar.gender}</p>
        </div>
        
        {/* Voice preview button (only shown if voice is selected and has preview) */}
        {selectedVoice && selectedVoice.preview_audio && (
          <Button
            size="sm"
            variant="outline"
            className="flex items-center gap-1 border-[#e6e6e6] hover:bg-gray-50"
            onClick={playVoicePreview}
          >
            <Volume2 size={16} />
            <span className="text-sm">{isPlayingAudio ? 'Stop' : 'Voice Sample'}</span>
          </Button>
        )}
      </div>
    </Card>
  );
} 