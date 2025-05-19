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

  // Handle language change
  useEffect(() => {
    fetchVoicePresets(language);
  }, [language, fetchVoicePresets]);

  // Handle audio play state
  useEffect(() => {
    if (!audioUrl) {
      setIsPlaying(false);
    }
  }, [audioUrl]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const request: GenerateSpeechRequest = {
      text,
      language,
      voice_settings: {
        stability,
        similarity_boost: similarityBoost
      }
    };
    
    // Set either voice_id or voice_preset based on the selected tab
    if (selectedTab === 'voice-id' && selectedVoiceId) {
      request.voice_id = selectedVoiceId;
    } else if (selectedTab === 'preset' && selectedPreset) {
      request.voice_preset = selectedPreset;
    }
    
    await generateAudio(request);
  };

  // Toggle play/pause
  const togglePlayPause = () => {
    if (isPlaying) {
      pauseAudio();
      setIsPlaying(false);
    } else {
      playAudio();
      setIsPlaying(true);
    }
  };

  // Render voice selection options
  const renderVoiceOptions = () => {
    if (isLoadingVoices) {
      return <SelectItem value="loading" disabled>Loading voices...</SelectItem>;
    }
    
    if (voices.length === 0) {
      return <SelectItem value="none" disabled>No voices available</SelectItem>;
    }
    
    return voices.map((voice: Voice) => (
      <SelectItem key={voice.voice_id} value={voice.voice_id}>
        {voice.name} {voice.accent ? `(${voice.accent})` : ''}
      </SelectItem>
    ));
  };

  // Render preset options
  const renderPresetOptions = () => {
    if (Object.keys(voicePresets).length === 0) {
      return <SelectItem value="none" disabled>No presets available</SelectItem>;
    }
    
    return Object.entries(voicePresets).map(([name, id]) => (
      <SelectItem key={id} value={name}>
        {name}
      </SelectItem>
    ));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Text to Speech Generation</CardTitle>
          <CardDescription>
            Generate natural-sounding speech from text using AI voices.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="text">Text to Convert</Label>
              <Textarea
                id="text"
                placeholder="Enter the text you want to convert to speech..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-[100px]"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select
                value={language}
                onValueChange={(value) => {
                  setLanguage(value);
                  // Reset voice selection when language changes
                  setSelectedVoiceId('');
                  setSelectedPreset('');
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="spanish">Spanish</SelectItem>
                  <SelectItem value="french">French</SelectItem>
                  <SelectItem value="german">German</SelectItem>
                  <SelectItem value="italian">Italian</SelectItem>
                  {/* Add more languages as needed */}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Voice Selection</Label>
              <Tabs defaultValue="voice-id" value={selectedTab} onValueChange={setSelectedTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="voice-id">Select by Voice</TabsTrigger>
                  <TabsTrigger value="preset">Use Preset</TabsTrigger>
                </TabsList>
                <TabsContent value="voice-id">
                  <Select
                    value={selectedVoiceId}
                    onValueChange={setSelectedVoiceId}
                    disabled={isLoadingVoices}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a voice" />
                    </SelectTrigger>
                    <SelectContent>
                      {renderVoiceOptions()}
                    </SelectContent>
                  </Select>
                </TabsContent>
                <TabsContent value="preset">
                  <Select
                    value={selectedPreset}
                    onValueChange={setSelectedPreset}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a preset" />
                    </SelectTrigger>
                    <SelectContent>
                      {renderPresetOptions()}
                    </SelectContent>
                  </Select>
                </TabsContent>
              </Tabs>
            </div>
            
            <div className="space-y-4 border rounded-md p-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="stability">Voice Stability: {stability.toFixed(2)}</Label>
                <span className="text-xs text-gray-500">Less variation</span>
              </div>
              <input
                id="stability"
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={stability}
                onChange={(e) => setStability(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
              
              <div className="flex items-center justify-between">
                <Label htmlFor="similarity-boost">Similarity Boost: {similarityBoost.toFixed(2)}</Label>
                <span className="text-xs text-gray-500">More like reference</span>
              </div>
              <input
                id="similarity-boost"
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={similarityBoost}
                onChange={(e) => setSimilarityBoost(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isGenerating || !text || (selectedTab === 'voice-id' && !selectedVoiceId) || (selectedTab === 'preset' && !selectedPreset)}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Volume2 className="mr-2 h-4 w-4" />
                  Generate Speech
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {isGenerating && currentJobId && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin text-blue-500" />
                <span>Processing your request...</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Job ID: {currentJobId}</span>
                <Badge variant={
                  currentJobStatus === 'pending' ? 'outline' :
                  currentJobStatus === 'processing' ? 'secondary' :
                  currentJobStatus === 'completed' ? 'default' : 'destructive'
                }>
                  {currentJobStatus}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {audioUrl && !isGenerating && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Audio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-100 p-4 rounded-md flex items-center justify-between">
              <div className="flex items-center">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={togglePlayPause}
                  className="mr-4"
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <div className="space-y-1">
                  <p className="font-medium truncate max-w-[250px]">{text.length > 40 ? `${text.substring(0, 40)}...` : text}</p>
                  <p className="text-xs text-gray-500">
                    {selectedTab === 'voice-id' ? 
                      voices.find(v => v.voice_id === selectedVoiceId)?.name :
                      `Preset: ${selectedPreset}`
                    }
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <a 
                  href={audioUrl} 
                  download="generated-speech.mp3"
                  className="h-9 w-9 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                </a>
                <Button variant="outline" size="icon" onClick={reset}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="text-sm text-gray-500">
            <div className="flex items-center">
              <Info className="h-4 w-4 mr-2" />
              <p>You can download the audio file or generate a new one.</p>
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  );
} 