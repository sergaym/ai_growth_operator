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
      case 'text_to_speech': return 'Generating speech...';
      case 'lipsync': return 'Syncing lips...';
      default: return 'Preparing generation...';
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
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-slate-900/70 to-slate-800/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                <div className="relative">
                  {/* Subtle background glow */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 rounded-2xl blur-xl"></div>
                  
                  {/* Main content card */}
                  <div className="relative bg-white/95 backdrop-blur-md rounded-2xl p-8 max-w-sm mx-4 text-center shadow-2xl border border-white/20">
                    
                    {/* Animated dots instead of spinner */}
                    <div className="flex justify-center items-center space-x-1 mb-6">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                    
                    {/* Step message with better typography */}
                    <h3 className="text-xl font-medium text-slate-800 mb-3 tracking-tight">
                      {getStepMessage(currentStep)}
                    </h3>
                    
                    {/* Subtle progress indicator */}
                    <div className="relative mb-6">
                      <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-700 ease-out"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-slate-500 mt-2 font-medium">{progress}% complete</p>
                    </div>
                    
                    {/* Step indicator dots */}
                    <div className="flex justify-center space-x-2 mb-6">
                      <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        currentStep === 'text_to_speech' || progress > 0 ? 'bg-blue-500' : 'bg-slate-300'
                      }`}></div>
                      <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        currentStep === 'lipsync' || progress > 50 ? 'bg-purple-500' : 'bg-slate-300'
                      }`}></div>
                    </div>
                    
                    {/* Cancel button with better design */}
                    <button
                      onClick={cancel}
                      className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors duration-200 font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Success State */}
            {result?.video_url ? (
              <div className="relative w-full h-full group">
                <video 
                  src={result.video_url} 
                  className="w-full h-full object-cover" 
                  controls 
                  autoPlay
                />
                
                {/* Elegant Actions Overlay */}
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button
                    onClick={handlePlayVideo}
                    className="inline-flex items-center gap-2 bg-white/95 backdrop-blur-sm hover:bg-white border border-slate-200/50 text-slate-700 hover:text-slate-900 rounded-lg px-3 py-2 text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                  >
                    <Play className="h-3.5 w-3.5" />
                    <span>Open</span>
                  </button>
                  <button
                    onClick={handleDownloadVideo}
                    className="inline-flex items-center gap-2 bg-slate-900/90 backdrop-blur-sm hover:bg-slate-900 border border-slate-700/50 text-white rounded-lg px-3 py-2 text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download</span>
                  </button>
                </div>
                
                {/* Refined Processing Time Badge */}
                {result.processing_time && (
                  <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full border border-white/20 font-medium">
                    Generated in {Math.round(result.processing_time)}s
                  </div>
                )}
                
                {/* Subtle success indicator */}
                <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-emerald-500/90 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium shadow-lg">
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    Ready
                  </div>
                </div>
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
