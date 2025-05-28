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

  // Show processing state if status is not completed OR if no file URL exists
  if (!asset.file_url) {
    return (
      <Card className="group border border-gray-200 hover:border-gray-300 transition-colors">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            {getAssetIcon(asset.type)}
            <div>
              <h3 className="font-medium text-gray-900">
                {formatAssetType(asset.type)}
              </h3>
              <p className="text-sm text-gray-500">
                Created {formatDate(asset.created_at)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge className={`${getStatusColor(asset.status)} flex items-center gap-1`}>
              {getStatusIcon(asset.status)}
              {asset.status}
            </Badge>
          </div>
        </div>
        
        <div className="p-4">
          <div className="aspect-video bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg flex items-center justify-center">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 mx-auto bg-slate-200 rounded-xl flex items-center justify-center">
                {getAssetIcon(asset.type)}
              </div>
              <div>
                <p className="text-slate-600 text-sm font-medium">
                  {asset.status === 'processing' ? 'Processing...' : 
                   asset.status === 'completed' ? 'Processing URL...' : 'Asset not ready'}
                </p>
                <p className="text-slate-400 text-xs">
                  {asset.status === 'processing' ? 'This may take a few minutes' : 
                   asset.status === 'completed' ? 'Finalizing asset URL' : 'Please try again later'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Video Asset
  if ((asset.type === 'video' || asset.type === 'lipsync_video') && asset.file_url) {
    return (
      <Card className="group border border-gray-200 hover:border-gray-300 transition-colors overflow-hidden">
        {showMetadata && (
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              {getAssetIcon(asset.type)}
              <div>
                <h3 className="font-medium text-gray-900">
                  {formatAssetType(asset.type)}
                </h3>
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  Created {formatDate(asset.created_at)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge className={`${getStatusColor(asset.status)} flex items-center gap-1`}>
                {getStatusIcon(asset.status)}
                {asset.status}
              </Badge>
              
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => window.open(asset.file_url, '_blank')}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
        
        <div className={compact ? "p-2" : "p-4"}>
          <div className={`relative aspect-video bg-black rounded-xl overflow-hidden ${compact ? 'shadow-md' : 'shadow-lg'} group/video`}>
            <video
              ref={videoRef}
              src={asset.file_url}
              className="w-full h-full object-cover"
              poster={asset.thumbnail_url}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onLoadedMetadata={() => {
                if (videoRef.current) {
                  setDuration(videoRef.current.duration);
                }
              }}
              onTimeUpdate={() => {
                if (videoRef.current) {
                  setCurrentTime(videoRef.current.currentTime);
                }
              }}
              onClick={togglePlayPause}
            >
              Your browser does not support the video tag.
            </video>
            
            {/* Video Controls Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover/video:bg-black/10 transition-all duration-300">
              {/* Play/Pause Button - Center */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/video:opacity-100 transition-opacity duration-300">
                <Button
                  size={compact ? "default" : "lg"}
                  onClick={togglePlayPause}
                  className={`${compact ? 'w-12 h-12' : 'w-16 h-16'} rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 border-white/20`}
                >
                  {isPlaying ? (
                    <Pause className={`${compact ? 'h-6 w-6' : 'h-8 w-8'} text-white`} />
                  ) : (
                    <Play className={`${compact ? 'h-6 w-6' : 'h-8 w-8'} text-white ml-1`} />
                  )}
                </Button>
              </div>
              
              {/* Top Actions */}
              {!compact && (
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover/video:opacity-100 transition-opacity duration-300">
                  <Button
                    size="sm"
                    onClick={handleDownload}
                    className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/20"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  {'share' in navigator && (
                    <Button
                      size="sm"
                      onClick={handleShare}
                      className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/20"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
              
              {/* Bottom Controls */}
              <div className={`absolute ${compact ? 'bottom-2 left-2' : 'bottom-4 left-4'} flex items-center gap-3 opacity-0 group-hover/video:opacity-100 transition-opacity duration-300`}>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={toggleMute}
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/20 p-2"
                >
                  {isMuted ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              {/* Status Badge */}
              <div className={`absolute ${compact ? 'top-2 left-2' : 'top-4 left-4'} opacity-0 group-hover/video:opacity-100 transition-opacity duration-300`}>
                <Badge className="bg-emerald-500/90 backdrop-blur-sm text-white border-0">
                  <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
                  Ready
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Audio Asset
  if (asset.type === 'audio' && asset.file_url) {
    return (
      <Card className="group border border-gray-200 hover:border-gray-300 transition-colors">
        {showMetadata && (
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              {getAssetIcon(asset.type)}
              <div>
                <h3 className="font-medium text-gray-900">
                  {formatAssetType(asset.type)}
                </h3>
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  Created {formatDate(asset.created_at)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge className={`${getStatusColor(asset.status)} flex items-center gap-1`}>
                {getStatusIcon(asset.status)}
                {asset.status}
              </Badge>
              
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
        
        <div className="p-4">
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-6 group/audio">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Music className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Audio Track</h4>
                  <p className="text-sm text-gray-500">Click to play</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={togglePlayPause}
                  className="w-10 h-10 rounded-full"
                >
                  {isPlaying ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Play className="h-5 w-5 ml-0.5" />
                  )}
                </Button>
              </div>
            </div>
            
            <audio
              ref={audioRef}
              src={asset.file_url}
              controls
              className="w-full"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            >
              Your browser does not support the audio tag.
            </audio>
          </div>
        </div>
      </Card>
    );
  }

  // Image Asset
  if (asset.type === 'image' && asset.file_url) {
    return (
      <Card className="group border border-gray-200 hover:border-gray-300 transition-colors">
        {showMetadata && (
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              {getAssetIcon(asset.type)}
              <div>
                <h3 className="font-medium text-gray-900">
                  {formatAssetType(asset.type)}
                </h3>
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  Created {formatDate(asset.created_at)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge className={`${getStatusColor(asset.status)} flex items-center gap-1`}>
                {getStatusIcon(asset.status)}
                {asset.status}
              </Badge>
              
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(asset.file_url, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDownload}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
        
        <div className="p-4">
          <div className="aspect-video bg-gray-50 rounded-lg overflow-hidden group/image relative">
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader className="h-8 w-8 text-gray-400 animate-spin" />
              </div>
            )}
            
            {imageError ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-2">
                  <AlertCircle className="h-8 w-8 text-gray-400 mx-auto" />
                  <p className="text-sm text-gray-500">Failed to load image</p>
                </div>
              </div>
            ) : (
              <img 
                src={asset.file_url} 
                alt="Project asset"
                className={`w-full h-full object-cover transition-opacity duration-300 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
              />
            )}
            
            {/* Image overlay actions */}
            <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/10 transition-all duration-300">
              <div className="absolute top-4 right-4 opacity-0 group-hover/image:opacity-100 transition-opacity duration-300">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => window.open(asset.file_url, '_blank')}
                    className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/20"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleDownload}
                    className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/20"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Fallback for unknown asset types
  return (
    <Card className="group border border-gray-200 hover:border-gray-300 transition-colors">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          {getAssetIcon(asset.type)}
          <div>
            <h3 className="font-medium text-gray-900">
              {formatAssetType(asset.type)}
            </h3>
            <p className="text-sm text-gray-500">
              Created {formatDate(asset.created_at)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge className={`${getStatusColor(asset.status)} flex items-center gap-1`}>
            {getStatusIcon(asset.status)}
            {asset.status}
          </Badge>
          
          {asset.file_url && (
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => window.open(asset.file_url, '_blank')}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
} 