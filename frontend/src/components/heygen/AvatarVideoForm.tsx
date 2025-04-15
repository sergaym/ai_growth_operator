import React, { useState, useEffect } from 'react';
import { HeygenVideoGenerationRequest, TrackedVideoGeneration, HeygenAvatar, HeygenVoice } from '@/types/heygen';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
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

  // Form validation state
  const [validationErrors, setValidationErrors] = useState<{
    prompt?: string;
    avatar_id?: string;
    voice_id?: string;
  }>({});

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
    
    // Clear validation error when field is updated
    if (validationErrors[name as keyof typeof validationErrors]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: {
      prompt?: string;
      avatar_id?: string;
      voice_id?: string;
    } = {};
    
    if (!formData.prompt.trim()) {
      errors.prompt = "Please enter a script for the avatar to speak";
    } else if (formData.prompt.length < 10) {
      errors.prompt = "Script should be at least 10 characters";
    }
    
    if (!formData.avatar_id) {
      errors.avatar_id = "Please select an avatar";
    }
    
    if (!formData.voice_id) {
      errors.voice_id = "Please select a voice";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      console.error('Form validation failed:', validationErrors);
      return;
    }
    
    console.log('Avatar form submitted with data:', formData);
    
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Script textarea */}
      <div className="space-y-2">
        <Label htmlFor="prompt" className="text-[#37352f] font-medium text-sm">Script</Label>
        <Textarea 
          id="prompt"
          value={formData.prompt}
          onChange={(e) => handleChange('prompt', e.target.value)}
          placeholder="Write what you want the avatar to say..."
          className="min-h-[120px] bg-white border-[#e6e6e6] rounded-md text-[#37352f] placeholder:text-[#9c9c9c] focus-visible:ring-[#e1e1e1] focus-visible:border-[#d1d1d1]"
          required
        />
        {validationErrors.prompt && (
          <div className="text-sm text-[#e03e21] mt-1">{validationErrors.prompt}</div>
        )}
      </div>

      {/* Avatar and Voice selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label htmlFor="avatar" className="text-[#37352f] font-medium text-sm">Avatar</Label>
          <Select 
            value={formData.avatar_id}
            onValueChange={(value: string) => handleChange('avatar_id', value)}
            disabled={isGenerating || avatars.length === 0}
          >
            <SelectTrigger 
              id="avatar"
              className="w-full bg-white border-[#e6e6e6] rounded-md focus:ring-[#e1e1e1] focus:border-[#d1d1d1]"
            >
              <SelectValue placeholder="Select avatar" />
            </SelectTrigger>
            <SelectContent className="bg-white border-[#e6e6e6] rounded-md">
              {avatars.length === 0 ? (
                <SelectItem value="no-avatars" disabled>No avatars available</SelectItem>
              ) : (
                avatars.map(avatar => (
                  <SelectItem key={avatar.avatar_id} value={avatar.avatar_id}>
                    {avatar.avatar_name} ({avatar.gender})
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {validationErrors.avatar_id && (
            <div className="text-sm text-[#e03e21] mt-1">{validationErrors.avatar_id}</div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="voice" className="text-[#37352f] font-medium text-sm">Voice</Label>
          <Select 
            value={formData.voice_id}
            onValueChange={(value: string) => handleChange('voice_id', value)}
            disabled={isGenerating || voices.length === 0}
          >
            <SelectTrigger 
              id="voice"
              className="w-full bg-white border-[#e6e6e6] rounded-md focus:ring-[#e1e1e1] focus:border-[#d1d1d1]"
            >
              <SelectValue placeholder="Select voice" />
            </SelectTrigger>
            <SelectContent className="bg-white border-[#e6e6e6] rounded-md">
              {voices.length === 0 ? (
                <SelectItem value="no-voices" disabled>No voices available</SelectItem>
              ) : (
                voices.map(voice => (
                  <SelectItem key={voice.voice_id} value={voice.voice_id}>
                    {voice.name} ({voice.gender}, {voice.language})
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {validationErrors.voice_id && (
            <div className="text-sm text-[#e03e21] mt-1">{validationErrors.voice_id}</div>
          )}
        </div>
      </div>

      {/* Additional options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="space-y-2">
          <Label htmlFor="background-color" className="text-[#37352f] font-medium text-sm">Background Color</Label>
          <div className="flex items-center">
            <input
              type="color"
              value={formData.background_color}
              onChange={(e) => handleChange('background_color', e.target.value)}
              className="h-8 w-8 rounded border border-[#e6e6e6] bg-transparent cursor-pointer"
            />
            <Input
              id="background-color"
              value={formData.background_color}
              onChange={(e) => handleChange('background_color', e.target.value)}
              className="ml-2 bg-white border-[#e6e6e6] rounded-md focus-visible:ring-[#e1e1e1] focus-visible:border-[#d1d1d1]"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="avatar-style" className="text-[#37352f] font-medium text-sm">Avatar Style</Label>
          <Select 
            value={formData.avatar_style}
            onValueChange={(value: string) => handleChange('avatar_style', value)}
            disabled={isGenerating}
          >
            <SelectTrigger 
              id="avatar-style"
              className="w-full bg-white border-[#e6e6e6] rounded-md focus:ring-[#e1e1e1] focus:border-[#d1d1d1]"
            >
              <SelectValue placeholder="Select style" />
            </SelectTrigger>
            <SelectContent className="bg-white border-[#e6e6e6] rounded-md">
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="circle">Circle</SelectItem>
              <SelectItem value="closeUp">Close Up</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="voice-speed" className="text-[#37352f] font-medium text-sm">Voice Speed</Label>
          <Input
            id="voice-speed"
            type="number"
            value={formData.voice_speed || 1.0}
            onChange={(e) => handleChange('voice_speed', parseFloat(e.target.value))}
            min="0.5"
            max="1.5"
            step="0.1"
            className="bg-white border-[#e6e6e6] rounded-md focus-visible:ring-[#e1e1e1] focus-visible:border-[#d1d1d1]"
            disabled={isGenerating}
          />
        </div>
      </div>

      <div className="pt-4 border-t border-[#f0f0f0]">
        <Button
          type="submit"
          disabled={isGenerating}
          className="bg-[#2d3748] hover:bg-[#1a202c] text-white rounded-md font-medium px-4 py-2 h-10"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            "Generate Video"
          )}
        </Button>
      </div>
    </form>
  );
} 