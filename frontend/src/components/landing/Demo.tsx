"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";

type VideoStyle = "cinematic" | "3d-animation" | "realistic" | "stylized";
type CameraMotion = "slow-zoom" | "orbit" | "fixed" | "pan";

export function Demo() {
  const [prompt, setPrompt] = useState("");
  const [videoStyle, setVideoStyle] = useState<VideoStyle>("cinematic");
  const [cameraMotion, setCameraMotion] = useState<CameraMotion>("slow-zoom");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    
    // Simulate video generation
    setTimeout(() => {
      setIsGenerating(false);
      setGeneratedVideo("/demo-video.mp4"); // This would be a real video path in production
    }, 3000);
  };
