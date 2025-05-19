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
import { Loader2, AlertCircle, Pause, Play, RefreshCw, Info, Upload, Video } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/components/ui/use-toast';
import { useImageToVideo } from '@/hooks/useImageToVideo';

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
  
  // Use our custom hook for all image-to-video API functionality
  const {
    isGenerating,
    currentJobId: jobId,
    currentJobStatus: jobStatus,
    videoUrl,
    error,
    generateFromUrl,
    generateFromFile,
    reset,
    checkApiStatus,
  } = useImageToVideo();

  // Check if backend API is accessible on component mount
  useEffect(() => {
    checkApiStatus().then((isAvailable: boolean) => {
      if (!isAvailable) {
        toast({
          title: 'API Connection Issue',
          description: 'Could not connect to the backend API. Some features may not work.',
          variant: 'destructive',
        });
      }
    });
  }, [checkApiStatus, toast]);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setImageFile(file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Reset URL field when file is selected
      setImageUrl('');
    }
  };

  // Handle image URL input
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageUrl(e.target.value);
    // Reset file selection when URL is entered
    setImageFile(null);
    setImagePreview(null);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate input
    if (!imageFile && !imageUrl) {
      toast({
        title: 'Missing input',
        description: 'Please provide an image file or URL',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      console.log('Submitting form with:', {
        imageFile: imageFile ? `${imageFile.name} (${imageFile.size} bytes, ${imageFile.type})` : 'none',
        imageUrl: imageUrl || 'none',
        prompt,
        duration,
        aspectRatio,
        negativePrompt,
        cfgScale
      });
      
      if (imageFile) {
        // Use the hook's file upload method
        await generateFromFile(imageFile, {
          prompt,
          duration,
          aspect_ratio: aspectRatio,
          negative_prompt: negativePrompt,
          cfg_scale: cfgScale
        });
      } else {
        // Use the hook's URL method
        await generateFromUrl({
          image_url: imageUrl,
          prompt,
          duration,
          aspect_ratio: aspectRatio,
          negative_prompt: negativePrompt,
          cfg_scale: cfgScale
        });
      }
    } catch (err) {
      console.error('Form submission error:', err);
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    }
  };

  // Toggle play/pause
  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Reset the form
  const handleReset = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageUrl('');
    setPrompt('Realistic, cinematic movement, high quality');
    setDuration('5');
    setAspectRatio('16:9');
    setNegativePrompt('blur, distort, and low quality');
    setCfgScale(0.5);
    reset(); // Reset the image-to-video state
  };
