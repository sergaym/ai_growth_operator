import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Download, 
  ExternalLink, 
  Film, 
  Sparkles, 
  Clock,
  Share2,
  RotateCcw,
  Volume2,
  VolumeX
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface VideoPreviewProps {
  videoUrl?: string;
  isGenerating?: boolean;
  progress?: number;
  currentStep?: string;
  error?: string;
  processingTime?: number;
  onRetry?: () => void;
  onCancel?: () => void;
  onReset?: () => void;
  showGettingStarted?: boolean;
}

export function VideoPreview({
  videoUrl,
  isGenerating = false,
  progress = 0,
  currentStep,
  error,
  processingTime,
  onRetry,
  onCancel,
  onReset,
  showGettingStarted = true,
}: VideoPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleDownload = () => {
    if (videoUrl) {
      const a = document.createElement('a');
      a.href = videoUrl;
      a.download = `ai-video-${Date.now()}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleShare = async () => {
    if (videoUrl && navigator.share) {
      try {
        await navigator.share({
          title: 'AI Generated Video',
          url: videoUrl,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else if (videoUrl) {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(videoUrl);
    }
  };
