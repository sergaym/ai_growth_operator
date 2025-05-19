"""
Schemas for Image-to-Video API endpoints in v1.
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, validator


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
    """Response model for video generation"""
    request_id: str = Field(..., description="Unique ID for the request")
    prompt: str = Field(..., description="Text prompt used for generation")
    status: str = Field(..., description="Status of the generation (completed/error)")
    timestamp: int = Field(..., description="Timestamp of the request")
    parameters: VideoGenerationParameters = Field(..., description="Parameters used for generation")
    video_url: Optional[str] = Field(None, description="URL to the generated video")
    video_path: Optional[str] = Field(None, description="Local path to the saved video file")
    preview_image_url: Optional[str] = Field(None, description="URL to the preview image")
    blob_url: Optional[str] = Field(None, description="Blob storage URL to the video")
    db_id: Optional[str] = Field(None, description="Database ID of the video record")
    source_image_id: Optional[str] = Field(None, description="ID of the source image used")
    error: Optional[str] = Field(None, description="Error message if generation failed")
    
    class Config:
        json_schema_extra = {
            "example": {
                "request_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
                "prompt": "Realistic, cinematic movement, high quality",
                "status": "completed",
                "timestamp": 1620000000,
                "parameters": {
                    "duration": "5",
                    "aspect_ratio": "16:9",
                    "cfg_scale": 0.5,
                    "prompt": "Realistic, cinematic movement, high quality",
                    "negative_prompt": "blur, distort, and low quality"
                },
                "video_url": "https://example.com/videos/generated.mp4",
                "preview_image_url": "https://example.com/videos/preview.jpg",
                "blob_url": "https://example.blob.core.windows.net/videos/generated.mp4",
                "db_id": "550e8400-e29b-41d4-a716-446655440000"
            }
        } 