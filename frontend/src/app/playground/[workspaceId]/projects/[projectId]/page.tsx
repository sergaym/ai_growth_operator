"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useWorkspaces } from "@/hooks/useWorkspace";
import { useVideoGeneration } from "@/hooks/useVideoGeneration";
import { useAuth } from "@/hooks/useAuth";
import PlaygroundLayout from "@/components/playground/Layout";
import { VideoPreview } from "@/components/chat/VideoPreview";
import { GestureChat } from "@/components/chat/GestureChat";

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

  return (
    <PlaygroundLayout
      title=""
      currentWorkspace={workspace}
    >
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Video Preview */}
        <VideoPreview
          videoUrl={result?.video_url}
          isGenerating={isGenerating}
          progress={progress}
          currentStep={currentStep ?? undefined}
          error={error ?? undefined}
          processingTime={result?.processing_time}
          onCancel={cancel}
          onReset={reset}
          onRetry={reset}
          showGettingStarted={!result && !error && !isGenerating}
        />

        {/* Enhanced Chat Input */}
        <GestureChat 
          projectId={stringProjectId} 
          onGenerateVideo={handleGenerateVideo}
          isGenerating={isGenerating}
          showTips={true}
        />
      </div>
    </PlaygroundLayout>
  );
}
