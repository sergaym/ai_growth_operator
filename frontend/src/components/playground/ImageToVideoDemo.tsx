/**
 * Image to Video Demo Component
 * Demonstrates integration with the image-to-video API
 */

"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, AlertCircle, Pause, Play, RefreshCw, Info, Upload, Video, Wrench } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/components/ui/use-toast';
import { useImageToVideo } from '@/hooks/useImageToVideo';
import { useBackendDiagnostics } from '@/hooks/useBackendDiagnostics';

export function ImageToVideoDemo() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Image state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  
  // Generation parameters
  const [prompt, setPrompt] = useState<string>('Realistic, cinematic movement, high quality');
  const [duration, setDuration] = useState<string>('5');
  const [aspectRatio, setAspectRatio] = useState<string>('16:9');
  const [negativePrompt, setNegativePrompt] = useState<string>('blur, distort, and low quality');
  const [cfgScale, setCfgScale] = useState<number>(0.5);
  
  // Video playback state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Diagnostic state
  const [showDiagnostics, setShowDiagnostics] = useState<boolean>(false);
  const { results: diagnosticResults, testApiConnection, testImageUpload } = useBackendDiagnostics();
  
  // Use our custom hook
  const {
    isGenerating,
    currentJobId: jobId,
    currentJobStatus: jobStatus,
    videoUrl,
    error,
    generateFromUrl,
    generateFromFile,
    reset
  } = useImageToVideo();

