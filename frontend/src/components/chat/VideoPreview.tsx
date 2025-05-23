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

  const getStepMessage = (step?: string) => {
    switch (step) {
      case 'text_to_speech': 
        return { title: 'Creating Voice', desc: 'Converting your text to natural speech' };
      case 'lipsync': 
        return { title: 'Syncing Lips', desc: 'Matching mouth movements to speech' };
      default: 
        return { title: 'Preparing', desc: 'Setting up your video generation' };
    }
  };

  const stepInfo = getStepMessage(currentStep);

  // Loading State
  if (isGenerating) {
    return (
      <div className="relative aspect-video bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl overflow-hidden shadow-sm border">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-purple-50/80 to-indigo-50/80 backdrop-blur-sm flex items-center justify-center">
          <Card className="max-w-sm mx-4 bg-white/95 backdrop-blur-md shadow-xl border-0">
            <div className="p-8 text-center space-y-6">
              {/* Animated Icon */}
              <div className="relative">
                <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
                  <Sparkles className="h-8 w-8 text-white animate-pulse" />
                </div>
                <div className="absolute inset-0 w-16 h-16 mx-auto bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl animate-ping opacity-20"></div>
              </div>
              
              {/* Step Info */}
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-slate-800">{stepInfo.title}</h3>
                <p className="text-sm text-slate-600">{stepInfo.desc}</p>
              </div>
              
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-xs text-slate-500">
                  <span>{progress}% complete</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    ~2-3 minutes
                  </span>
                </div>
              </div>
              
              {/* Step Indicators */}
              <div className="flex justify-center space-x-3">
                <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  currentStep === 'text_to_speech' || progress > 0 ? 'bg-blue-500 shadow-lg shadow-blue-500/30' : 'bg-slate-300'
                }`} />
                <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  currentStep === 'lipsync' || progress > 50 ? 'bg-purple-500 shadow-lg shadow-purple-500/30' : 'bg-slate-300'
                }`} />
              </div>
              
              {/* Cancel Button */}
              {onCancel && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onCancel}
                  className="text-slate-500 hover:text-slate-700"
                >
                  Cancel Generation
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="relative aspect-video bg-gradient-to-br from-red-50 to-rose-100 rounded-xl overflow-hidden shadow-sm border border-red-200">
        <div className="absolute inset-0 flex items-center justify-center p-6">
          <Card className="max-w-sm mx-4 bg-white shadow-xl border-0">
            <div className="p-8 text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-red-100 rounded-2xl flex items-center justify-center">
                <RotateCcw className="h-8 w-8 text-red-500" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-red-800">Generation Failed</h3>
                <p className="text-sm text-red-600">{error}</p>
              </div>
              
              <div className="flex gap-2 justify-center pt-2">
                {onRetry && (
                  <Button onClick={onRetry} size="sm">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                )}
                {onReset && (
                  <Button variant="ghost" onClick={onReset} size="sm">
                    Start Over
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

