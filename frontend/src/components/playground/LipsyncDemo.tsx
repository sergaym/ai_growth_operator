/**
 * Lipsync Demo Component
 * Demonstrates integration with the lipsync API
 */

"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, AlertCircle, Pause, Play, RefreshCw, Info, Upload, Video, Music } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { useLipsync } from '@/hooks/useLipsync';

export function LipsyncDemo() {
  const { toast } = useToast();
  const videoFileInputRef = useRef<HTMLInputElement>(null);
  const audioFileInputRef = useRef<HTMLInputElement>(null);
  
  // Video and audio state
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  
  // URL inputs
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [audioUrl, setAudioUrl] = useState<string>('');
  
  // Video playback state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Tab state
  const [activeTab, setActiveTab] = useState<string>('upload');
  
  // Use our custom hook for all lipsync API functionality
  const {
    isProcessing,
    videoUrl: generatedVideoUrl,
    error,
    progress,
    generateFromUrls,
    generateFromFiles,
    reset,
    checkApiStatus,
  } = useLipsync();

  // Check if backend API is accessible on component mount
  useEffect(() => {
    checkApiStatus().then((isAvailable: boolean) => {
      if (!isAvailable) {
        toast({
          title: 'API Connection Issue',
          description: 'Could not connect to the lipsync API. Some features may not work.',
          variant: 'destructive',
        });
      }
    });
  }, [checkApiStatus, toast]);

  // Handle video file selection
  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setVideoFile(file);
      
      // Create a preview URL for video
      const videoUrl = URL.createObjectURL(file);
      setVideoPreview(videoUrl);
    }
  };

  // Handle audio file selection
  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setAudioFile(file);
      
      // Create a preview URL for audio
      const audioUrl = URL.createObjectURL(file);
      setAudioPreview(audioUrl);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (activeTab === 'upload') {
      // Validate file inputs
      if (!videoFile || !audioFile) {
        toast({
          title: 'Missing files',
          description: 'Please upload both video and audio files',
          variant: 'destructive',
        });
        return;
      }
      
      try {
        await generateFromFiles(videoFile, audioFile);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An error occurred';
        toast({
          title: 'Error',
          description: message,
          variant: 'destructive',
        });
      }
    } else {
      // Validate URL inputs
      if (!videoUrl || !audioUrl) {
        toast({
          title: 'Missing URLs',
          description: 'Please provide both video and audio URLs',
          variant: 'destructive',
        });
        return;
      }
      
      try {
        await generateFromUrls({
          video_url: videoUrl,
          audio_url: audioUrl,
          save_result: true
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An error occurred';
        toast({
          title: 'Error',
          description: message,
          variant: 'destructive',
        });
      }
    }
  };

