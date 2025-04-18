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
