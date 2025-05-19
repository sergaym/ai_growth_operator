import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface VideoGenerationRequest {
  image_url?: string;
  prompt?: string;
  duration?: string;
  aspect_ratio?: string;
  negative_prompt?: string;
  cfg_scale?: number;
}

interface VideoJob {
  job_id: string;
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

export function useImageToVideo() {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [currentJobStatus, setCurrentJobStatus] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Generate video from URL
  const generateFromUrl = useCallback(async (request: VideoGenerationRequest) => {
    setError(null);
    setIsGenerating(true);
    
    try {
      // Log the request for debugging
      console.log('Sending image-to-video request:', request);
      
      const response = await fetch('/api/v1/image-to-video/generate', {
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
      setCurrentJobId(data.job_id);
      setCurrentJobStatus(data.status);
      
      // Start polling for job status
      if (data.job_id) {
        pollJobStatus(data.job_id);
      }
      
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start video generation';
      console.error('Video generation error:', message);
      setError(message);
      setIsGenerating(false);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      return null;
    }
  }, [toast]);

  // Generate video from file
  const generateFromFile = useCallback(async (
    file: File, 
    options: Omit<VideoGenerationRequest, 'image_url'> = {}
  ) => {
    setError(null);
    setIsGenerating(true);
    
    try {
      // Create a FormData object for file upload
      const formData = new FormData();
      
      // Important: Append the file with the key 'file' as expected by the backend
      // Include the filename to ensure it's properly sent
      formData.append('file', file, file.name);
     
      // Add optional parameters as string values
      if (options.prompt) formData.append('prompt', options.prompt);
      if (options.duration) formData.append('duration', options.duration);
      if (options.aspect_ratio) formData.append('aspect_ratio', options.aspect_ratio);
      if (options.negative_prompt) formData.append('negative_prompt', options.negative_prompt);
      if (options.cfg_scale !== undefined) formData.append('cfg_scale', options.cfg_scale.toString());
      
      // Log detailed information about the request for debugging
      
      // Using fetch directly with FormData - no need to set Content-Type header
      // The browser will automatically set it with the correct boundary
      const response = await fetch('/api/v1/image-to-video/from-file', {
        method: 'POST',
        body: formData
        // Do NOT set 'Content-Type': 'multipart/form-data' header - browser will do this automatically with the correct boundary
      });
      
      // Log response status for debugging
      
      // Check for successful response
      if (!response.ok) {
        let errorText = await response.text();
        let errorDetails = errorText;
        let userFriendlyMessage = 'Failed to upload and process image';
        
        try {
          // Try to parse as JSON for better error messages
          const errorJson = JSON.parse(errorText);
          errorDetails = errorJson.detail || errorJson.error || errorText;
          
          // Create user-friendly error message based on status code
          if (response.status === 404) {
            userFriendlyMessage = 'The image-to-video service endpoint could not be found. Please check if the backend service is running.';
          } else if (response.status === 413) {
            userFriendlyMessage = 'The image is too large. Please use a smaller image file.';
          } else if (response.status === 415) {
            userFriendlyMessage = 'Unsupported image format. Please use JPEG, PNG or WebP images.';
          } else if (response.status === 422) {
            userFriendlyMessage = 'The request was invalid. The file upload may be corrupted or missing required fields.';
            // Log detailed validation error for debugging
            console.error('Validation error details:', errorJson);
          } else if (response.status === 429) {
            userFriendlyMessage = 'Too many requests. Please try again later.';
          } else if (response.status >= 500) {
            userFriendlyMessage = 'Server error. The image-to-video service is experiencing issues.';
          }
          
          // Add details if available
          if (errorDetails && errorDetails !== "Not Found") {
            userFriendlyMessage += ` Details: ${typeof errorDetails === 'string' ? errorDetails : JSON.stringify(errorDetails)}`;
          }
        } catch (e) {
          // If not JSON, use text as is
          console.log('Error response is not JSON:', errorText);
        }
        
        console.error('File upload error response:', errorDetails);
        throw new Error(userFriendlyMessage);
      }
      
      // Parse successful response
      const data = await response.json();
      console.log('API success response:', data);
      setCurrentJobId(data.job_id);
      setCurrentJobStatus(data.status);
      
      // Start polling for job status
      if (data.job_id) {
        pollJobStatus(data.job_id);
      }
      
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to upload and process image';
      console.error('File upload error:', err);
      setError(message);
      setIsGenerating(false);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      return null;
    }
  }, [toast]);

  // Poll for job status
  const pollJobStatus = useCallback(async (jobId: string) => {
    try {
      console.log(`Polling status for job: ${jobId}`);
      const response = await fetch(`/api/v1/image-to-video/status/${jobId}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Status polling error: ${errorText}`);
        throw new Error(`Error checking status: ${response.status}`);
      }
      
      const job: VideoJob = await response.json();
      console.log(`Job ${jobId} status:`, job.status);
      setCurrentJobStatus(job.status);
      
      if (job.status === 'completed' && job.result?.video_url) {
        setVideoUrl(job.result.video_url);
        if (job.result.preview_image_url) {
          setPreviewUrl(job.result.preview_image_url);
        }
        setIsGenerating(false);
        toast({
          title: 'Video generation complete',
          description: 'Your video has been generated successfully.',
        });
      } else if (job.status === 'error') {
        setError(job.error || 'An error occurred during video generation');
        setIsGenerating(false);
        toast({
          title: 'Generation failed',
          description: job.error || 'An error occurred during video generation',
          variant: 'destructive',
        });
      } else if (job.status === 'pending' || job.status === 'processing') {
        // Continue polling every 2 seconds
        setTimeout(() => pollJobStatus(jobId), 2000);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error checking job status';
      console.error('Status polling error:', message);
      setError(message);
      setIsGenerating(false);
    }
  }, [toast]);

  // Get job status manually
  const getJobStatus = useCallback(async (jobId: string) => {
    try {
      const response = await fetch(`/api/v1/image-to-video/status/${jobId}`);
      
      if (!response.ok) {
        throw new Error(`Error checking status: ${response.status}`);
      }
      
      return await response.json();
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Error checking job status' };
    }
  }, []);

  // Reset state
  const reset = useCallback(() => {
    setIsGenerating(false);
    setCurrentJobId(null);
    setCurrentJobStatus(null);
    setVideoUrl(null);
    setPreviewUrl(null);
    setError(null);
  }, []);

  return {
    isGenerating,
    currentJobId,
    currentJobStatus,
    videoUrl,
    previewUrl,
    error,
    generateFromUrl,
    generateFromFile,
    getJobStatus,
    pollJobStatus,
    reset,
  };
} 