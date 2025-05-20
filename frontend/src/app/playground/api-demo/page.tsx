"use client";

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PlaygroundLayout from '@/components/playground/Layout';
import { TextToImageDemo } from '@/components/playground/TextToImageDemo';
import { TextToSpeechDemo } from '@/components/playground/TextToSpeechDemo';
import { ImageToVideoDemo } from '@/components/playground/ImageToVideoDemo';
import { LipsyncDemo } from '@/components/playground/LipsyncDemo';
import { ImageIcon, MicIcon, VideoIcon, HeadphonesIcon } from 'lucide-react';

export default function ApiDemoPage() {
  return (
    <PlaygroundLayout
      title="API Playground"
      description="Explore the AI content generation capabilities."
    >
      <Tabs defaultValue="text-to-image" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full max-w-3xl mx-auto">
          <TabsTrigger value="text-to-image" className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Text to Image</span>
          </TabsTrigger>
          <TabsTrigger value="text-to-speech" className="flex items-center gap-2">
            <MicIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Text to Speech</span>
          </TabsTrigger>
          <TabsTrigger value="image-to-video" className="flex items-center gap-2">
            <VideoIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Image to Video</span>
          </TabsTrigger>
          <TabsTrigger value="lipsync" className="flex items-center gap-2">
            <HeadphonesIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Lipsync</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="text-to-image" className="space-y-4">
          <TextToImageDemo />
        </TabsContent>
        
        <TabsContent value="text-to-speech" className="space-y-4">
          <TextToSpeechDemo />
        </TabsContent>
        
        <TabsContent value="image-to-video" className="space-y-4">
          <ImageToVideoDemo />
        </TabsContent>
        
        <TabsContent value="lipsync" className="space-y-4">
          <LipsyncDemo />
        </TabsContent>
      </Tabs>
    </PlaygroundLayout>
  );
} 