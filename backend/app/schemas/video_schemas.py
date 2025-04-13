"""
Video-related schemas for the AI Growth Operator API.
"""

from typing import List, Dict, Any, Optional, Union
from pydantic import BaseModel, AnyHttpUrl, Field


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
    
class VideoGenerationResponse(BaseModel):
    """Response model for video generation"""
    video_url: str  # URL to the generated video
    prompt_used: str  # The prompt used to generate the video
    duration: str  # Actual duration of the generated video
    thumbnail_url: Optional[str] = None  # URL to the video thumbnail
    generation_id: str  # Unique ID for the generation job
    status: str  # Status of the video generation (e.g., "completed", "processing")
    estimated_completion_time: Optional[str] = None  # Estimated completion time if processing 