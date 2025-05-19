"""
Schemas for Lipsync API endpoints in v1.
"""

from typing import Optional, Dict, Any
from pydantic import BaseModel, Field, validator, AnyHttpUrl


class LipsyncRequest(BaseModel):
    """Request model for generating a lip-synced video."""
    video_url: Optional[str] = Field(None, description="URL of the source video")
    audio_url: Optional[str] = Field(None, description="URL of the audio to synchronize with")
    video_path: Optional[str] = Field(None, description="Path to local video file (server-side only)")
    audio_path: Optional[str] = Field(None, description="Path to local audio file (server-side only)")
    save_result: bool = Field(True, description="Whether to save the result to disk")
    user_id: Optional[str] = Field(None, description="ID of the user making the request")
    workspace_id: Optional[str] = Field(None, description="ID of the workspace for the request")
    
    @validator('video_url', 'audio_url')
    def validate_urls(cls, v):
        """Validate URLs while keeping them as strings for JSON serialization"""
        if v is not None:
            try:
                # Try to construct an AnyHttpUrl to validate, but return original string
                AnyHttpUrl(v)
                return v
            except Exception as e:
                raise ValueError(f"Invalid URL: {str(e)}")
        return v


class LipsyncResponse(BaseModel):
    """Response model for lipsync generation requests."""
    status: str = Field(..., description="Status of the operation (completed, error)")
    video_url: Optional[str] = Field(None, description="URL to access the generated video")
    preview_image_url: Optional[str] = Field(None, description="URL to a preview image of the video")
    duration: Optional[float] = Field(None, description="Duration of the generated video in seconds")
    error: Optional[str] = Field(None, description="Error message if status is 'error'")
    created_at: Optional[float] = Field(None, description="Timestamp when the video was created")
    local_path: Optional[str] = Field(None, description="Local path to saved video file")
    blob_url: Optional[str] = Field(None, description="URL to video in blob storage if uploaded")
    
    class Config:
        """Pydantic config."""
        extra = "allow"  # Allow additional fields that are not defined in the schema


class LipsyncDocumentationExample(BaseModel):
    """Examples for documentation and testing."""
    url_example: Dict[str, Any] = Field(
        {
            "video_url": "https://example.com/source-video.mp4",
            "audio_url": "https://example.com/audio-file.mp3",
            "save_result": True
        },
        description="Example of using URLs for video and audio"
    )
    path_example: Dict[str, Any] = Field(
        {
            "video_path": "/path/to/local/video.mp4",
            "audio_path": "/path/to/local/audio.mp3",
            "save_result": True
        },
        description="Example of using local file paths (server-side only)"
    ) 