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

  // Toggle play/pause for the generated video
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
    setVideoFile(null);
    setAudioFile(null);
    setVideoPreview(null);
    setAudioPreview(null);
    setVideoUrl('');
    setAudioUrl('');
    if (videoFileInputRef.current) videoFileInputRef.current.value = '';
    if (audioFileInputRef.current) audioFileInputRef.current.value = '';
    reset();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Lipsync Video Generation</CardTitle>
          <CardDescription>
            Synchronize lip movements in a video with the provided audio.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="upload">File Upload</TabsTrigger>
              <TabsTrigger value="url">URL Input</TabsTrigger>
            </TabsList>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* File Upload Tab */}
              <TabsContent value="upload" className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Video Upload */}
                  <div className="space-y-2">
                    <Label htmlFor="video-file">Video File</Label>
                    <Card className="cursor-pointer" onClick={() => videoFileInputRef.current?.click()}>
                      <CardContent className="flex flex-col items-center justify-center p-6">
                        <input
                          type="file"
                          id="video-file"
                          ref={videoFileInputRef}
                          onChange={handleVideoFileChange}
                          accept="video/*"
                          className="hidden"
                        />
                        {videoPreview ? (
                          <div className="w-full relative aspect-video">
                            <video 
                              src={videoPreview} 
                              className="w-full h-full object-cover rounded-md"
                              controls 
                            />
                          </div>
                        ) : (
                          <div className="flex flex-col items-center py-4">
                            <Video className="h-10 w-10 text-gray-400 mb-2" />
                            <p className="text-sm font-medium">Upload a video</p>
                            <p className="text-xs text-gray-500 mt-1">MP4, MOV, WEBM</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Audio Upload */}
                  <div className="space-y-2">
                    <Label htmlFor="audio-file">Audio File</Label>
                    <Card className="cursor-pointer" onClick={() => audioFileInputRef.current?.click()}>
                      <CardContent className="flex flex-col items-center justify-center p-6">
                        <input
                          type="file"
                          id="audio-file"
                          ref={audioFileInputRef}
                          onChange={handleAudioFileChange}
                          accept="audio/*"
                          className="hidden"
                        />
                        {audioPreview ? (
                          <div className="w-full flex items-center justify-center py-4">
                            <audio 
                              src={audioPreview} 
                              className="w-full"
                              controls 
                            />
                          </div>
                        ) : (
                          <div className="flex flex-col items-center py-4">
                            <Music className="h-10 w-10 text-gray-400 mb-2" />
                            <p className="text-sm font-medium">Upload audio</p>
                            <p className="text-xs text-gray-500 mt-1">MP3, WAV, OGG</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
              
              {/* URL Input Tab */}
              <TabsContent value="url" className="space-y-4">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="video-url">Video URL</Label>
                    <Input
                      id="video-url"
                      type="url"
                      placeholder="https://example.com/video.mp4"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="audio-url">Audio URL</Label>
                    <Input
                      id="audio-url"
                      type="url"
                      placeholder="https://example.com/audio.mp3"
                      value={audioUrl}
                      onChange={(e) => setAudioUrl(e.target.value)}
                    />
                  </div>
                </div>
              </TabsContent>
              
              {/* Submit Button */}
              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  className="flex-1" 
                  disabled={isProcessing || 
                    (activeTab === 'upload' && (!videoFile || !audioFile)) || 
                    (activeTab === 'url' && (!videoUrl || !audioUrl))}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Video className="mr-2 h-4 w-4" />
                      Generate Lipsync Video
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            <p>{error}</p>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Processing Status */}
      {isProcessing && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin text-blue-500" />
                  <span>Processing your request...</span>
                </div>
                <Badge variant="secondary">Processing</Badge>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-gray-500 text-right">{progress}% complete</p>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Generated Video Display */}
      {generatedVideoUrl && !isProcessing && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Lipsync Video</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative aspect-video bg-black rounded-md overflow-hidden">
              <video
                ref={videoRef}
                src={generatedVideoUrl}
                className="w-full h-full object-contain"
                controls={false}
                loop
                onEnded={() => setIsPlaying(false)}
                onPause={() => setIsPlaying(false)}
                onPlay={() => setIsPlaying(true)}
              />
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={togglePlayPause}
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <a 
                href={generatedVideoUrl} 
                download="lipsync-video.mp4"
                className="h-9 inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground"
              >
                Download
              </a>
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RefreshCw className="h-4 w-4 mr-2" />
                New Video
              </Button>
            </div>
          </CardContent>
          <CardFooter className="text-sm text-gray-500">
            <div className="flex items-center">
              <Info className="h-4 w-4 mr-2" />
              <p>Your video will be available for download for a limited time.</p>
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  );
} 