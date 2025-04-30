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
      <div className="max-w-5xl mx-auto py-8">
        <GestureChat />
      </div>
    </PlaygroundLayout>
  );
} 