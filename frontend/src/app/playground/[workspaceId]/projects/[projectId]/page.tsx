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
        {/* Video Preview with Progress */}
        <div className="mb-6">
          <div className="aspect-video bg-zinc-100 rounded-lg flex items-center justify-center overflow-hidden shadow-sm relative">
            
            {/* Generation Progress Overlay */}
            {isGenerating && (
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center z-10">
                <div className="bg-white rounded-lg p-6 max-w-sm mx-4 text-center">
                  <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {getStepMessage(currentStep)}
                  </h3>
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                    <div 
                      className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{progress}% complete</p>
                  <button
                    onClick={cancel}
                    className="inline-flex items-center gap-2 text-sm text-red-600 hover:text-red-800 underline"
                  >
                    <X className="h-4 w-4" />
                    Cancel Generation
                  </button>
                </div>
              </div>
            )}

            {/* Success State */}
            {result?.video_url ? (
              <div className="relative w-full h-full">
                <video 
                  src={result.video_url} 
                  className="w-full h-full object-cover" 
                  controls 
                  autoPlay
                />
                {/* Success Actions Overlay */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    onClick={handlePlayVideo}
                    className="bg-white/90 hover:bg-white text-green-700 rounded-lg px-3 py-2 text-sm font-medium shadow-sm border flex items-center gap-1"
                  >
                    <Play className="h-4 w-4" />
                    Open
                  </button>
                  <button
                    onClick={handleDownloadVideo}
                    className="bg-white/90 hover:bg-white text-green-700 rounded-lg px-3 py-2 text-sm font-medium shadow-sm border flex items-center gap-1"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </button>
                </div>
                {/* Processing Time */}
                {result.processing_time && (
                  <div className="absolute bottom-4 left-4 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    Generated in {Math.round(result.processing_time)}s
                  </div>
                )}
              </div>
            ) : error ? (
              // Error State
              <div className="text-center p-6">
                <div className="text-red-500 mb-4">
                  <X className="h-12 w-12 mx-auto mb-2" />
                  <h3 className="text-lg font-semibold">Generation Failed</h3>
                </div>
                <p className="text-sm text-red-600 mb-4">{error}</p>
                <button
                  onClick={reset}
                  className="text-sm text-red-600 hover:text-red-800 underline"
                >
                  Try Again
                </button>
              </div>
            ) : (
              // Empty State
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
          onGenerateVideo={handleGenerateVideo}
          isGenerating={isGenerating}
        />
      </div>
    </PlaygroundLayout>
  );
}
