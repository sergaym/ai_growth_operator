import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface LipsyncGenerationRequest {
  video_url?: string;
  audio_url?: string;
  video_path?: string;
  audio_path?: string;
  save_result?: boolean;
}

interface LipsyncJob {
  job_id?: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  created_at?: number;
  updated_at?: number;
  result?: {
    video_url?: string;
    preview_image_url?: string;
    [key: string]: any;
  };
  error?: string;
}

export function useLipsync() {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);

  // Check if the API is accessible
  const checkApiStatus = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/v1/lipsync/examples', {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        console.warn(`Lipsync API check failed: ${response.status} ${response.statusText}`);
        return false;
      }
      
      console.log('Lipsync API is accessible');
      return true;
    } catch (err) {
      console.error('Failed to connect to lipsync API:', err);
      return false;
    }
  }, []);

  // Generate lipsync from URLs
  const generateFromUrls = useCallback(async (request: LipsyncGenerationRequest) => {
    setError(null);
    setIsProcessing(true);
    setProgress(0);
    
    try {
      // Validate input
      if (!request.video_url && !request.audio_url) {
        throw new Error('Both video and audio URLs are required');
      }
      
      console.log('Sending lipsync request:', request);
      
      const response = await fetch('/api/v1/lipsync/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        throw new Error(`Error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('API success response:', data);
      
      if (data.video_url) {
        setVideoUrl(data.video_url);
        setIsProcessing(false);
        toast({
          title: 'Lipsync complete',
          description: 'Your lip-synced video has been generated successfully.',
        });
        return data;
      } else {
        throw new Error('No video URL returned from the server');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate lip-synced video';
      console.error('Lipsync generation error:', message);
      setError(message);
      setIsProcessing(false);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      return null;
    }
  }, [toast]);

  // Upload file (video or audio)
  const uploadFile = useCallback(async (file: File, fileType: 'video' | 'audio') => {
    try {
      // Create a FormData object for file upload
      const formData = new FormData();
      formData.append('file', file, file.name);
      formData.append('file_type', fileType);
      
      // Log file details for debugging
      console.log(`Uploading ${fileType} file:`, {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: new Date(file.lastModified).toISOString()
      });
      
      // Validate file size
      const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB limit
      if (file.size > MAX_FILE_SIZE) {
        throw new Error(`File size exceeds the maximum allowed size of ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
      }
      
      // Determine allowed file types based on whether uploading video or audio
      const allowedVideoTypes = ['video/mp4', 'video/quicktime', 'video/mpeg', 'video/webm'];
      const allowedAudioTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/ogg'];
      
      const allowedTypes = fileType === 'video' ? allowedVideoTypes : allowedAudioTypes;
      
      if (!allowedTypes.includes(file.type)) {
        throw new Error(`Unsupported file type: ${file.type}. Please use ${fileType === 'video' ? 'MP4, MOV' : 'MP3, WAV'} files.`);
      }
      
      const uploadUrl = '/api/v1/lipsync/upload';
      console.log(`Sending file upload to: ${uploadUrl}`);
      
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('File upload error response:', errorText);
        throw new Error(`Error uploading file: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Upload success response:', data);
      
      return data.url;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to upload file';
      console.error('File upload error:', message);
      throw new Error(message);
    }
  }, []);

  // Process from uploaded files
  const generateFromFiles = useCallback(async (videoFile: File, audioFile: File) => {
    setError(null);
    setIsProcessing(true);
    setProgress(10);
    
    try {
      // Upload video file
      const videoUrl = await uploadFile(videoFile, 'video');
      setProgress(40);
      
      // Upload audio file
      const audioUrl = await uploadFile(audioFile, 'audio');
      setProgress(70);
      
      // Generate lipsync with uploaded URLs
      const result = await generateFromUrls({
        video_url: videoUrl,
        audio_url: audioUrl,
        save_result: true
      });
      
      setProgress(100);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to process files';
      setError(message);
      setIsProcessing(false);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      return null;
    }
  }, [toast, uploadFile, generateFromUrls]);

  // Reset state
  const reset = useCallback(() => {
    setIsProcessing(false);
    setVideoUrl(null);
    setError(null);
    setProgress(0);
  }, []);

  return {
    isProcessing,
    videoUrl,
    error,
    progress,
    generateFromUrls,
    generateFromFiles,
    uploadFile,
    reset,
    checkApiStatus,
  };
} 