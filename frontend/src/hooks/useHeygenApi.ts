import { useState, useEffect, useCallback } from 'react';
import { heygenAPI } from '@/services/api';
import { 
  HeygenAvatar, 
  HeygenVoice, 
  HeygenVideoGenerationRequest, 
  HeygenVideoResponse 
} from '@/types/heygen';

// Hook for fetching avatars
export function useHeygenAvatars() {
  const [avatars, setAvatars] = useState<HeygenAvatar[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAvatars = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await heygenAPI.listAvatars();
      setAvatars(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAvatars();
  }, [fetchAvatars]);

  return { avatars, loading, error, refetch: fetchAvatars };
}

// Hook for fetching voices
export function useHeygenVoices() {
  const [voices, setVoices] = useState<HeygenVoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVoices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await heygenAPI.listVoices();
      setVoices(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVoices();
  }, [fetchVoices]);

  return { voices, loading, error, refetch: fetchVoices };
}

// Hook for generating videos
export function useHeygenVideoGeneration() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoResponse, setVideoResponse] = useState<HeygenVideoResponse | null>(null);

  const generateVideo = useCallback(async (request: HeygenVideoGenerationRequest) => {
    setLoading(true);
    setError(null);
    try {
      const data = await heygenAPI.generateVideo(request);
      setVideoResponse(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return { generateVideo, loading, error, videoResponse };
}

// Hook for checking video status with polling
export function useHeygenVideoStatus(videoId: string | null, pollInterval = 5000) {
  const [videoStatus, setVideoStatus] = useState<HeygenVideoResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);

  // Function to fetch the current status
  const checkStatus = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await heygenAPI.checkVideoStatus(id);
      setVideoStatus(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Start or stop polling
  const togglePolling = useCallback((shouldPoll: boolean) => {
    setPolling(shouldPoll);
  }, []);

  // Fetch the status once when videoId changes
  useEffect(() => {
    if (videoId) {
      checkStatus(videoId);
    } else {
      setVideoStatus(null);
    }
  }, [videoId, checkStatus]);

  // Set up polling
  useEffect(() => {
    if (!videoId || !polling) return;

    // Don't poll if video is already completed or failed
    if (videoStatus?.status === 'completed' || videoStatus?.status === 'failed') {
      setPolling(false);
      return;
    }

    const interval = setInterval(async () => {
      const status = await checkStatus(videoId);
      
      // Stop polling when video is completed or failed
      if (status?.status === 'completed' || status?.status === 'failed') {
        setPolling(false);
      }
    }, pollInterval);

    return () => clearInterval(interval);
  }, [videoId, polling, pollInterval, videoStatus?.status, checkStatus]);

  return { 
    videoStatus, 
    loading, 
    error, 
    checkStatus: videoId ? () => checkStatus(videoId) : null,
    startPolling: () => togglePolling(true),
    stopPolling: () => togglePolling(false),
    isPolling: polling
  };
} 