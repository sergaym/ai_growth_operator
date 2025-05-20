"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useWorkspaces } from "@/hooks/useWorkspace";
import PlaygroundLayout from "@/components/playground/Layout";
import { GestureChat } from "@/components/chat/GestureChat";
import { Film } from "lucide-react";

export default function ProjectPage() {
  const { workspaceId, projectId } = useParams();
  const stringWorkspaceId = workspaceId as string || '';
  const stringProjectId = projectId as string || '';
  const { workspaces } = useWorkspaces();
  const currentWorkspace = workspaces.find(ws => ws.id === stringWorkspaceId);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoLoading, setVideoLoading] = useState(false);

  const workspace = currentWorkspace 
    ? { id: currentWorkspace.id, name: currentWorkspace.name }
    : { id: stringWorkspaceId, name: "Workspace" };

  // Handler for when the GestureChat component generates a video
  const handleVideoGenerated = (url: string) => {
    setVideoLoading(true);
    
    // Simulate video loading with delay
    setTimeout(() => {
      setVideoUrl(url);
      setVideoLoading(false);
    }, 1000);
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
