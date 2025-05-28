import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Download, 
  ExternalLink, 
  Video,
  Music,
  Image as ImageIcon,
  FileText,
  Clock,
  Share2,
  Volume2,
  VolumeX,
  Calendar,
  CheckCircle,
  Loader,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import type { ProjectAsset } from '@/contexts/ProjectsContext';

interface AssetViewerProps {
  asset: ProjectAsset;
  onDelete?: (assetId: string) => void;
  compact?: boolean;
  showMetadata?: boolean;
}

export function AssetViewer({
  asset,
  onDelete,
  compact = false,
  showMetadata = true,
}: AssetViewerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlayPause = () => {
    const mediaElement = videoRef.current || audioRef.current;
    if (mediaElement) {
      if (isPlaying) {
        mediaElement.pause();
      } else {
        mediaElement.play();
      }
    }
  };

  const toggleMute = () => {
    const mediaElement = videoRef.current || audioRef.current;
    if (mediaElement) {
      mediaElement.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleDownload = () => {
    if (asset.file_url) {
      const a = document.createElement('a');
      a.href = asset.file_url;
      a.download = `${formatAssetType(asset.type)}-${asset.id}.${getFileExtension(asset.type)}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleShare = async () => {
    if (asset.file_url && navigator.share) {
      try {
        await navigator.share({
          title: `AI Generated ${formatAssetType(asset.type)}`,
          url: asset.file_url,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else if (asset.file_url) {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(asset.file_url);
    }
  };

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'video':
      case 'lipsync_video':
        return <Video className="h-4 w-4 text-blue-600" />;
      case 'audio':
        return <Music className="h-4 w-4 text-purple-600" />;
      case 'image':
        return <ImageIcon className="h-4 w-4 text-green-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatAssetType = (type: string) => {
    switch (type) {
      case 'lipsync_video':
        return 'Lip-sync Video';
      default:
        return type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ');
    }
  };

  const getFileExtension = (type: string) => {
    switch (type) {
      case 'video':
      case 'lipsync_video':
        return 'mp4';
      case 'audio':
        return 'mp3';
      case 'image':
        return 'jpg';
      default:
        return 'file';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-3 w-3" />;
      case 'processing':
        return <Loader className="h-3 w-3 animate-spin" />;
      case 'failed':
        return <AlertCircle className="h-3 w-3" />;
      default:
        return null;
    }
  };
