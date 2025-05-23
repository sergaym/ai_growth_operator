"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useWorkspaces } from "@/hooks/useWorkspace";
import { useVideoGeneration } from "@/hooks/useVideoGeneration";
import { useAuth } from "@/hooks/useAuth";
import PlaygroundLayout from "@/components/playground/Layout";
import { GestureChat } from "@/components/chat/GestureChat";
import { Film, Play, Download, X } from "lucide-react";

export default function ProjectPage() {
  const { workspaceId, projectId } = useParams();
  const stringWorkspaceId = workspaceId as string || '';
  const stringProjectId = projectId as string || '';
  const { workspaces } = useWorkspaces();
  const { user } = useAuth();
  const currentWorkspace = workspaces.find(ws => ws.id === stringWorkspaceId);

  const workspace = currentWorkspace 
    ? { id: currentWorkspace.id, name: currentWorkspace.name }
    : { id: stringWorkspaceId, name: "Workspace" };

  // Video generation state
  const { 
    generateVideo, 
    isGenerating, 
    progress, 
    currentStep, 
    result, 
    error, 
    cancel, 
    reset 
  } = useVideoGeneration();

  // Handle video generation request from GestureChat
  const handleGenerateVideo = async (text: string, actorId: string, actorVideoUrl: string, language: string) => {
    if (!user?.isAuthenticated || !user?.user) {
      alert('Please log in to generate videos');
      return;
    }

    if (!actorId || !actorVideoUrl) {
      alert('Please select a valid actor');
      return;
    }

    try {
      await generateVideo({
        text: text.trim(),
        actor_id: String(actorId),
        actor_video_url: actorVideoUrl,
        language: language,
        voice_preset: 'professional_male',
        project_id: stringProjectId,
        user_id: String(user.user.id),
        workspace_id: user.user.workspaces?.[0]?.id ? String(user.user.workspaces[0].id) : undefined,
      });
    } catch (error) {
      console.error('Failed to start video generation:', error);
    }
  };

  const handlePlayVideo = () => {
    if (result?.video_url) {
      window.open(result.video_url, '_blank');
    }
  };

  const handleDownloadVideo = () => {
    if (result?.video_url) {
      const a = document.createElement('a');
      a.href = result.video_url;
      a.download = `generated-video-${Date.now()}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const getStepMessage = (step?: string | null) => {
    switch (step) {
      case 'text_to_speech': return '🎙️ Generating Speech...';
      case 'lipsync': return '💋 Syncing Lips...';
      default: return '🚀 Starting Generation...';
    }
  };

  return (
    <PlaygroundLayout
      title="AI Video Generator"
      description="Use the chat to generate videos with AI actors"
      currentWorkspace={workspace}
    >
      <div className="max-w-5xl mx-auto">
        {/* Video Preview */}
        <div className="mb-6">
          <div className="aspect-video bg-zinc-100 rounded-lg flex items-center justify-center overflow-hidden shadow-sm">
            {videoLoading ? (
              <div className="flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-2"></div>
                <p className="text-sm text-zinc-500">Generating video...</p>
              </div>
            ) : videoUrl ? (
              <video 
                src={videoUrl} 
                className="w-full h-full object-cover" 
                controls 
                autoPlay
              />
            ) : (
              <div className="text-zinc-400 text-sm text-center p-4">
                <Film className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Describe what you want the AI actor to do</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat Input */}
        <GestureChat 
          projectId={stringProjectId} 
          onVideoGenerated={handleVideoGenerated}
        />
      </div>
    </PlaygroundLayout>
  );
}
