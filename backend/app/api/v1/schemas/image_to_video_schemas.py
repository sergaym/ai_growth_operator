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
    image_url: Optional[str] = Field(None, description="URL to the source image")
    image_base64: Optional[str] = Field(None, description="Base64-encoded image data")
    image_path: Optional[str] = Field(None, description="Path to local image file (server-side only)")
    
    prompt: str = Field("Realistic, cinematic movement, high quality", 
                        description="Text description to guide the video generation")
    
    duration: Duration = Field(Duration.SHORT, description="Video duration in seconds")
    
    aspect_ratio: AspectRatio = Field(AspectRatio.LANDSCAPE, 
                                      description="Aspect ratio of the output video")
    
    negative_prompt: str = Field("blur, distort, and low quality", 
                                description="What to avoid in the video")
    
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

class VideoResponse(BaseModel):
    """Response model for single video information."""
    id: str = Field(..., description="Unique ID of the video")
    prompt: Optional[str] = Field(None, description="Text prompt used to generate the video")
    duration: Optional[str] = Field(None, description="Duration of the video")
    aspect_ratio: Optional[str] = Field(None, description="Aspect ratio of the video")
    
    video_url: Optional[str] = Field(None, description="URL to the video file")
    local_url: Optional[str] = Field(None, description="Local URL to the video file")
    blob_url: Optional[str] = Field(None, description="Blob storage URL to the video file")
    
    preview_image_url: Optional[str] = Field(None, description="URL to a preview image of the video")
    
    status: str = Field(..., description="Status of the video generation")
    
    user_id: Optional[str] = Field(None, description="ID of the user who created the video")
    workspace_id: Optional[str] = Field(None, description="ID of the workspace the video belongs to")
    
    source_image_id: Optional[str] = Field(None, description="ID of the source image used to generate the video")
    
    created_at: Optional[str] = Field(None, description="Timestamp when the video was created")
    updated_at: Optional[str] = Field(None, description="Timestamp when the video was last updated")
    
    metadata_json: Optional[Dict[str, Any]] = Field(None, description="Additional metadata about the video")
    
    @model_validator(mode='before')
    @classmethod
    def convert_datetime_to_str(cls, data: Dict[str, Any]) -> Dict[str, Any]:
        """Convert datetime objects to strings."""
        if not isinstance(data, dict):
            return data
            
        # Convert created_at from datetime to string if present
        if data.get('created_at') and isinstance(data['created_at'], datetime):
            data['created_at'] = data['created_at'].isoformat()
            
        # Convert updated_at from datetime to string if present
        if data.get('updated_at') and isinstance(data['updated_at'], datetime):
            data['updated_at'] = data['updated_at'].isoformat()
            
        return data
    
    class Config:
        """Pydantic config."""
        from_attributes = True

class VideoListResponse(BaseModel):
    """Response model for listing videos."""
    items: List[VideoResponse] = Field(..., description="List of videos")
    total: int = Field(..., description="Total number of videos matching the query")
    skip: int = Field(..., description="Number of videos skipped")
    limit: int = Field(..., description="Maximum number of videos returned")
    
    class Config:
        """Pydantic config."""
        from_attributes = True 