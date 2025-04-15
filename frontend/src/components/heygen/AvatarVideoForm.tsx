import React, { useState, useEffect } from 'react';
import { HeygenVideoGenerationRequest, TrackedVideoGeneration, HeygenAvatar, HeygenVoice } from '@/types/heygen';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

interface AvatarVideoFormProps {
  onVideoGenerated: (formData: HeygenVideoGenerationRequest) => Promise<any>;
  avatars: HeygenAvatar[];
  voices: HeygenVoice[];
  isGenerating: boolean;
}

export default function AvatarVideoForm({ onVideoGenerated, avatars, voices, isGenerating }: AvatarVideoFormProps) {
  // Form state
  const [formData, setFormData] = useState<HeygenVideoGenerationRequest>({
    prompt: '',
    avatar_id: '',
    voice_id: '',
    background_color: '#ffffff', // Updated to white background
    avatar_style: 'normal',
    voice_speed: 1.0,
  });

  // Set default avatar and voice when loaded
  useEffect(() => {
    if (avatars.length > 0 && !formData.avatar_id) {
      setFormData(prev => ({ ...prev, avatar_id: avatars[0].avatar_id }));
    }
  }, [avatars, formData.avatar_id]);

  useEffect(() => {
    if (voices.length > 0 && !formData.voice_id) {
      setFormData(prev => ({ ...prev, voice_id: voices[0].voice_id }));
    }
  }, [voices, formData.voice_id]);

  // Handle form changes
  const handleChange = (name: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Avatar form submitted with data:', formData);
    
    if (!formData.prompt || !formData.avatar_id || !formData.voice_id) {
      console.error('Missing required fields:', { 
        hasPrompt: !!formData.prompt, 
        hasAvatarId: !!formData.avatar_id, 
        hasVoiceId: !!formData.voice_id 
      });
      return;
    }
    
    try {
      console.log('Calling onVideoGenerated with:', formData);
      // Call the parent function with the form data
      await onVideoGenerated(formData);
      
      // Reset the prompt (but keep avatar/voice selections)
      setFormData(prev => ({ ...prev, prompt: '' }));
    } catch (error) {
      console.error('Failed to generate video:', error);
    }
  };

  const isLoading = false; // Now controlled by props
  const hasError = false; // Now controlled by props

  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          {hasError && (
            <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-600">
              <AlertDescription>
                Error occurred while loading resources
              </AlertDescription>
            </Alert>
          )}
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="prompt" className="text-blue-600 font-medium">Avatar Video Script</Label>
            <Textarea 
              id="prompt"
              value={formData.prompt}
              onChange={(e) => handleChange('prompt', e.target.value)}
              placeholder="Write the text you want the avatar to speak..."
              className="min-h-[120px] bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus-visible:ring-blue-500/30 focus-visible:border-blue-500/50"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="avatar" className="text-blue-600 font-medium">Avatar</Label>
              <Select 
                value={formData.avatar_id}
                onValueChange={(value: string) => handleChange('avatar_id', value)}
                disabled={isLoading}
              >
                <SelectTrigger 
                  id="avatar"
                  className="w-full bg-slate-50 border-slate-200 focus:ring-blue-500/30 focus:border-blue-500/50"
                >
                  <SelectValue placeholder="Select avatar" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200">
                  {isLoading ? (
                    <SelectItem value="loading" disabled>Loading avatars...</SelectItem>
                  ) : (
                    avatars.map(avatar => (
                      <SelectItem key={avatar.avatar_id} value={avatar.avatar_id}>
                        {avatar.avatar_name} ({avatar.gender})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="voice" className="text-blue-600 font-medium">Voice</Label>
              <Select 
                value={formData.voice_id}
                onValueChange={(value: string) => handleChange('voice_id', value)}
                disabled={isLoading}
              >
                <SelectTrigger 
                  id="voice"
                  className="w-full bg-slate-50 border-slate-200 focus:ring-blue-500/30 focus:border-blue-500/50"
                >
                  <SelectValue placeholder="Select voice" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200">
                  {isLoading ? (
                    <SelectItem value="loading" disabled>Loading voices...</SelectItem>
                  ) : (
                    voices.map(voice => (
                      <SelectItem key={voice.voice_id} value={voice.voice_id}>
                        {voice.name} ({voice.gender}, {voice.language})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="background-color" className="text-blue-600 font-medium">Background Color</Label>
              <div className="flex items-center">
                <input
                  type="color"
                  value={formData.background_color}
                  onChange={(e) => handleChange('background_color', e.target.value)}
                  className="h-10 w-10 rounded border border-slate-200 bg-transparent"
                />
                <Input
                  id="background-color"
                  value={formData.background_color}
                  onChange={(e) => handleChange('background_color', e.target.value)}
                  className="ml-2 bg-slate-50 border-slate-200 focus-visible:ring-blue-500/30 focus-visible:border-blue-500/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="avatar-style" className="text-blue-600 font-medium">Avatar Style</Label>
              <Select 
                value={formData.avatar_style}
                onValueChange={(value: string) => handleChange('avatar_style', value)}
              >
                <SelectTrigger 
                  id="avatar-style"
                  className="w-full bg-slate-50 border-slate-200 focus:ring-blue-500/30 focus:border-blue-500/50"
                >
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200">
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="circle">Circle</SelectItem>
                  <SelectItem value="closeUp">Close Up</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="voice-speed" className="text-blue-600 font-medium">Voice Speed</Label>
              <Input
                id="voice-speed"
                type="number"
                value={formData.voice_speed || 1.0}
                onChange={(e) => handleChange('voice_speed', parseFloat(e.target.value))}
                min="0.5"
                max="1.5"
                step="0.1"
                className="bg-slate-50 border-slate-200 focus-visible:ring-blue-500/30 focus-visible:border-blue-500/50"
              />
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={isGenerating || !formData.prompt || !formData.avatar_id || !formData.voice_id}
            className={`bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white ${
              isGenerating || !formData.prompt || !formData.avatar_id || !formData.voice_id
                ? "opacity-50 cursor-not-allowed"
                : "shadow-md shadow-blue-500/20 hover:shadow-blue-500/30 hover:translate-y-[-1px]"
            }`}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Avatar Video"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
} 