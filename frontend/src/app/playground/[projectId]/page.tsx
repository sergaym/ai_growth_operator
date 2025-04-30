"use client";
import React from "react";
import { useParams } from "next/navigation";
import PlaygroundLayout from "@/components/playground/Layout";
import { GestureChat } from "@/components/chat/GestureChat";

export default function ProjectPage() {
  // Use the useParams hook to get the projectId
  const params = useParams();
  const projectId = params.projectId as string;

  return (
    <PlaygroundLayout
      title={`Project ${projectId}`}
      description="Create your video scene"
    >
      <div className="flex flex-col h-[calc(78vh-64px)]">
        {/* Main Content Area */}
        <div className="flex-1 overflow-auto">
          {/* Your other content goes here */}
        </div>

        {/* Chat Area at Bottom */}
        <div className="flex-shrink-0">
          <div className="container max-w-5xl mx-auto px-4 py-3">
            <GestureChat />
          </div>
        </div>
      </div>
    </PlaygroundLayout>
  );
} 