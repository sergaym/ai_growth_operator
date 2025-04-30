"use client";
import React from "react";
import PlaygroundLayout from "@/components/playground/Layout";
import { GestureChat } from "@/components/chat/GestureChat";

export default function ProjectPage({ params }: { params: { projectId: string } }) {
  return (
    <PlaygroundLayout
      title={`Project ${params.projectId}`}
      description="Create your video scene"
    >
      <div className="fixed inset-0 top-16 flex flex-col">
        {/* Main Content Area */}
        <div className="flex-1 overflow-auto">
          {/* Your other content goes here */}
        </div>

        {/* Chat Area at Bottom - Fixed Height */}
        <div className="flex-shrink-0">
          <div className="px-4 py-3">
            <GestureChat />
          </div>
        </div>
      </div>
    </PlaygroundLayout>
  );
} 