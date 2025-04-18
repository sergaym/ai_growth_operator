import { useState, useEffect, useCallback } from 'react';
import { heygenAPI } from '@/services/api';
import { 
  HeygenAvatar, 
  HeygenVoice, 
  HeygenVideoGenerationRequest, 
  HeygenVideoResponse,
  DatabaseAvatarVideo 
} from '@/types/heygen';

/**
 * Hook for fetching avatars from the HeyGen API
 * @returns Object containing avatars, loading state, error, and refetch function
 */
export function useHeygenAvatars() {
  const [avatars, setAvatars] = useState<HeygenAvatar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAvatars = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching HeyGen avatars...');
      const data = await heygenAPI.listAvatars();
      console.log(`Successfully fetched ${data.length} HeyGen avatars`);
      setAvatars(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Failed to fetch HeyGen avatars:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAvatars();
  }, [fetchAvatars]);

  return { avatars, loading, error, refetch: fetchAvatars };
}

/**
 * Hook for fetching voices from the HeyGen API
 * @returns Object containing voices, loading state, error, and refetch function
 */
export function useHeygenVoices() {
  const [voices, setVoices] = useState<HeygenVoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVoices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching HeyGen voices...');
      const data = await heygenAPI.listVoices();
      console.log(`Successfully fetched ${data.length} HeyGen voices`);
      setVoices(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Failed to fetch HeyGen voices:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVoices();
  }, [fetchVoices]);

  return { voices, loading, error, refetch: fetchVoices };
}

/**
 * Hook for generating videos using the HeyGen API
 * @returns Object containing generateVideo function, loading state, error, and video response
 */
export function useHeygenVideoGeneration() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoResponse, setVideoResponse] = useState<HeygenVideoResponse | null>(null);

  const generateVideo = useCallback(async (request: HeygenVideoGenerationRequest) => {
    setLoading(true);
    setError(null);
    try {
      console.log('Generating HeyGen avatar video with request:', request);
      const data = await heygenAPI.generateVideo(request);
      console.log('Successfully started video generation:', data);
      setVideoResponse(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Failed to generate HeyGen video:', errorMessage);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return { generateVideo, loading, error, videoResponse };
}

/**
 * Hook for checking video status with polling
 * @param videoId - The ID of the video to check
 * @param pollInterval - The interval in milliseconds between polls (default: 5000ms)
 * @returns Object containing video status and control functions
 */
export function useHeygenVideoStatus(videoId: string | null, pollInterval = 5000) {
  const [videoStatus, setVideoStatus] = useState<HeygenVideoResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);

  // Function to fetch the current status
  const checkStatus = useCallback(async (id: string) => {
    if (!id) return null;
    
    setLoading(true);
    setError(null);
    try {
      console.log(`Checking status for video ID: ${id}`);
      const data = await heygenAPI.checkVideoStatus(id);
      console.log(`Video ${id} status:`, data.status);
      setVideoStatus(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error(`Failed to check status for video ${id}:`, errorMessage);
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Start polling
  const startPolling = useCallback(() => {
    if (!videoId) {
      console.warn('Cannot start polling: No video ID provided');
      return;
    }
    console.log(`Starting polling for video ID: ${videoId}`);
    setPolling(true);
  }, [videoId]);

  // Stop polling
  const stopPolling = useCallback(() => {
    console.log('Stopping polling for video status');
    setPolling(false);
  }, []);

  // Fetch the status once when videoId changes
  useEffect(() => {
    if (videoId) {
      console.log(`Initial status check for video ID: ${videoId}`);
      checkStatus(videoId);
    } else {
      setVideoStatus(null);
    }
  }, [videoId, checkStatus]);

  // Set up polling
  useEffect(() => {
    if (!videoId || !polling) return undefined;

    // Don't poll if video is already completed or failed
    if (videoStatus?.status === 'completed' || videoStatus?.status === 'failed') {
      console.log(`Stopping polling for video ${videoId} because status is ${videoStatus?.status}`);
      setPolling(false);
      return undefined;
    }

    console.log(`Setting up polling interval for video ${videoId} (${pollInterval}ms)`);
    const interval = setInterval(async () => {
      console.log(`Polling for video ${videoId} status...`);
      const status = await checkStatus(videoId);
      
      // Stop polling when video is completed or failed
      if (status?.status === 'completed' || status?.status === 'failed') {
        console.log(`Video ${videoId} is now ${status.status}, stopping polling`);
        setPolling(false);
      }
    }, pollInterval);

    return () => {
      console.log(`Cleaning up polling interval for video ${videoId}`);
      clearInterval(interval);
    };
  }, [videoId, polling, pollInterval, videoStatus?.status, checkStatus]);

  return { 
    videoStatus, 
    loading, 
    error, 
    checkStatus: videoId ? () => checkStatus(videoId) : null,
    startPolling,
    stopPolling,
    isPolling: polling
  };
} 