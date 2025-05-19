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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Image to Video Generation</CardTitle>
          <CardDescription>
            Transform your static images into dynamic videos with AI movement.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Source Section */}
            <div className="space-y-4">
              <Label>Image Source</Label>
              
              {/* File Upload Area */}
              <div className="grid gap-4 sm:grid-cols-2">
                <Card className="cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <CardContent className="flex flex-col items-center justify-center p-6">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    {imagePreview ? (
                      <div className="w-full relative aspect-video">
                        <img 
                          src={imagePreview} 
                          alt="Selected image" 
                          className="w-full h-full object-cover rounded-md"
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center py-4">
                        <Upload className="h-10 w-10 text-gray-400 mb-2" />
                        <p className="text-sm font-medium">Upload an image</p>
                        <p className="text-xs text-gray-500 mt-1">Click to browse files</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {/* URL Input */}
                <div className="space-y-2">
                  <Label htmlFor="image-url">Or enter image URL</Label>
                  <div className="flex flex-col gap-2">
                    <input
                      id="image-url"
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      value={imageUrl}
                      onChange={handleUrlChange}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Generation Parameters */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="prompt">Prompt</Label>
                <Textarea
                  id="prompt"
                  placeholder="Describe how you want the video to look and move"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
              
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Duration Selection */}
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration</Label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 seconds</SelectItem>
                      <SelectItem value="10">10 seconds</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Aspect Ratio Selection */}
                <div className="space-y-2">
                  <Label htmlFor="aspect-ratio">Aspect Ratio</Label>
                  <Select value={aspectRatio} onValueChange={setAspectRatio}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select aspect ratio" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="16:9">Landscape (16:9)</SelectItem>
                      <SelectItem value="9:16">Portrait (9:16)</SelectItem>
                      <SelectItem value="1:1">Square (1:1)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Advanced Options */}
              <div className="space-y-4 border rounded-md p-4">
                <h3 className="text-sm font-medium">Advanced Options</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="negative-prompt">Negative Prompt</Label>
                  <Textarea
                    id="negative-prompt"
                    placeholder="What to avoid in the generated video"
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                    className="min-h-[60px]"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="cfg-scale">Prompt Strength: {cfgScale.toFixed(2)}</Label>
                  </div>
                  <Slider
                    id="cfg-scale"
                    min={0}
                    max={1}
                    step={0.01}
                    value={[cfgScale]}
                    onValueChange={(value) => setCfgScale(value[0])}
                  />
                  <div className="flex justify-between text-xs text-gray-500 pt-1">
                    <span>Subtle</span>
                    <span>Strong</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              {/* Submit Button */}
              <Button 
                type="submit" 
                className="flex-1" 
                disabled={isGenerating || (!imageFile && !imageUrl)}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Video className="mr-2 h-4 w-4" />
                    Generate Video
                  </>
                )}
              </Button>
            </div>
          </form>
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
      {isGenerating && jobId && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin text-blue-500" />
                <span>Processing your request...</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Job ID: {jobId}</span>
                <Badge variant={
                  jobStatus === 'pending' ? 'outline' :
                  jobStatus === 'processing' ? 'secondary' :
                  jobStatus === 'completed' ? 'default' : 'destructive'
                }>
                  {jobStatus}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Generated Video Display */}
      {videoUrl && !isGenerating && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Video</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative aspect-video bg-black rounded-md overflow-hidden">
              <video
                ref={videoRef}
                src={videoUrl}
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
            
            <div className="flex justify-between">
              <div className="space-y-1">
                <h4 className="font-medium">Prompt</h4>
                <p className="text-sm text-gray-500 max-w-[500px] truncate">{prompt}</p>
              </div>
              <div className="flex space-x-2">
                <a 
                  href={videoUrl} 
                  download="generated-video.mp4"
                  className="h-9 inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                >
                  Download
                </a>
                <Button variant="outline" size="sm" onClick={handleReset}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  New Video
                </Button>
              </div>
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