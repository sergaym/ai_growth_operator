/**
 * Text to Speech Demo Component
 * Demonstrates integration with the text-to-speech API
 */

"use client";

import React, { useState, useEffect } from 'react';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import type { GenerateSpeechRequest, Voice, VoiceSettings } from '@/types/text-to-speech';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Volume2, AlertCircle, Pause, Play, RefreshCw, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function TextToSpeechDemo() {
  // Voice selection state
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>('');
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [selectedTab, setSelectedTab] = useState<string>('voice-id');
  const [language, setLanguage] = useState<string>('english');
  
  // Text input state
  const [text, setText] = useState<string>('');
  
  // Voice settings
  const [stability, setStability] = useState<number>(0.5);
  const [similarityBoost, setSimilarityBoost] = useState<number>(0.75);
  
  // Player state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  
  // Use our custom hook
  const {
    voices,
    voicePresets,
    isLoadingVoices,
    isGenerating,
    currentJobId,
    currentJobStatus,
    audioUrl,
    error,
    fetchVoices,
    fetchVoicePresets,
    generateAudio,
    playAudio,
    pauseAudio,
    reset
  } = useTextToSpeech({ defaultLanguage: language });

