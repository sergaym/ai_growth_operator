"use client";

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PlaygroundLayout from '@/components/playground/Layout';
import { TextToImageDemo } from '@/components/playground/TextToImageDemo';
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
          <div className="bg-slate-100 dark:bg-slate-800 p-8 rounded-lg text-center">
            <h3 className="text-xl font-medium mb-2">Text to Speech Demo</h3>
            <p className="text-slate-600 dark:text-slate-300">
              Coming soon! This feature will allow you to convert text to natural-sounding speech.
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="image-to-video" className="space-y-4">
          <div className="bg-slate-100 dark:bg-slate-800 p-8 rounded-lg text-center">
            <h3 className="text-xl font-medium mb-2">Image to Video Demo</h3>
            <p className="text-slate-600 dark:text-slate-300">
              Coming soon! This feature will allow you to animate static images into videos.
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="lipsync" className="space-y-4">
          <div className="bg-slate-100 dark:bg-slate-800 p-8 rounded-lg text-center">
            <h3 className="text-xl font-medium mb-2">Lipsync Demo</h3>
            <p className="text-slate-600 dark:text-slate-300">
              Coming soon! This feature will allow you to synchronize audio with video for realistic talking faces.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </PlaygroundLayout>
  );
} 