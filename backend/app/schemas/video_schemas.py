"""
Video-related schemas for the AI Growth Operator API.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class VideoPromptRequest(BaseModel):
    """Request model for video prompt generation"""
    marketing_idea: Dict[str, Any]
    visual_style: Optional[str] = None
    duration: Optional[str] = "30 seconds"
    references: Optional[List[str]] = None

class VideoPromptResponse(BaseModel):
    """Response model for video prompt generation"""
    prompt: str

class VideoGenerationSettings(BaseModel):
    """Settings for video generation"""
    visual_style: Optional[str] = None  # Visual style (e.g., "cinematic", "3d_animation")
    duration: Optional[str] = "30 seconds"  # Target duration
    aspect_ratio: Optional[str] = "16:9"  # Aspect ratio of the video
    references: Optional[List[str]] = None  # Reference URLs or descriptions
    music_type: Optional[str] = None  # Type of background music
    include_text_overlays: Optional[bool] = True  # Whether to include text overlays

class GenerateVideoFromIdeaRequest(BaseModel):
    """Request model for generating a video directly from an idea"""
    idea: Dict[str, Any]  # The idea response from idea generation endpoint
    video_settings: VideoGenerationSettings
    
