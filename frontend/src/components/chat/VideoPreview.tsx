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

