"""
Schemas for Image-to-Video API endpoints in v1.
"""

from typing import Optional, List, Dict, Any
from enum import Enum
from datetime import datetime
from pydantic import BaseModel, Field, validator, model_validator


class AspectRatio(str, Enum):
    """Valid aspect ratios for video generation."""
    LANDSCAPE = "16:9"
    PORTRAIT = "9:16"
    SQUARE = "1:1"

class Duration(str, Enum):
    """Valid durations for video generation."""
    SHORT = "5"
    LONG = "10"

class GenerateVideoRequest(BaseModel):
    """Request model for generating a video from an image."""
    image_url: Optional[str] = Field(None, description="URL of the source image")
    image_base64: Optional[str] = Field(None, description="Base64-encoded image data")
    image_path: Optional[str] = Field(None, description="Path to local image file (server-side only)")
    
    prompt: str = Field("Realistic, cinematic movement, high quality", description="Text description to guide the video generation")
    duration: str = Field("5", description="Video duration in seconds ('5' or '10')")
    aspect_ratio: str = Field("16:9", description="Aspect ratio of the output video ('16:9', '9:16', '1:1')")
    negative_prompt: str = Field("blur, distort, and low quality", description="What to avoid in the video")
    cfg_scale: float = Field(0.5, description="How closely to follow the prompt (0.0-1.0)")
    
    user_id: Optional[str] = Field(None, description="ID of the user making the request")
    workspace_id: Optional[str] = Field(None, description="ID of the workspace for the request")
    
    @validator('duration')
    def validate_duration(cls, v):
        if v not in ["5", "10"]:
            raise ValueError("Duration must be '5' or '10'")
        return v
    
    @validator('aspect_ratio')
    def validate_aspect_ratio(cls, v):
        if v not in ["16:9", "9:16", "1:1"]:
            raise ValueError("Aspect ratio must be '16:9', '9:16', or '1:1'")
        return v
    
    @validator('cfg_scale')
    def validate_cfg_scale(cls, v):
        if v < 0.0 or v > 1.0:
            raise ValueError("cfg_scale must be between 0.0 and 1.0")
        return v


class VideoGenerationResponse(BaseModel):
    """Response model for video generation requests."""
    job_id: str = Field(..., description="Unique ID for this job")
    status: str = Field(..., description="Status of the job (pending, processing, completed, error)")
    
    # Optional fields that may be present depending on the status
    message: Optional[str] = Field(None, description="Information message")
    error: Optional[str] = Field(None, description="Error message if status is 'error'")
    video_url: Optional[str] = Field(None, description="URL to the generated video if available")
    preview_image_url: Optional[str] = Field(None, description="URL to a preview image of the video")
    created_at: Optional[float] = Field(None, description="Timestamp when the job was created")
    updated_at: Optional[float] = Field(None, description="Timestamp when the job was last updated") 