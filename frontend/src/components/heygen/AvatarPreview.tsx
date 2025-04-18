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

