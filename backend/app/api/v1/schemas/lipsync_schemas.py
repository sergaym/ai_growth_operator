"""
Schemas for the Lipsync API endpoints.
This module provides Pydantic models for request validation and response formatting.
"""

from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field, HttpUrl, validator
from enum import Enum


class LipsyncRequest(BaseModel):
    """
    Request model for lipsync generation.
    Either file paths or URLs must be provided for both video and audio.
    """
    video_path: Optional[str] = Field(
        None,
        description="Path to the local video file"
    )
    video_url: Optional[HttpUrl] = Field(
        None,
        description="URL to a hosted video file"
    )
    audio_path: Optional[str] = Field(
        None,
        description="Path to the local audio file"
    )
    audio_url: Optional[HttpUrl] = Field(
        None,
        description="URL to a hosted audio file"
    )
    save_result: bool = Field(
        True,
        description="Whether to save the result to disk"
    )
    
    @validator('video_path', 'video_url', 'audio_path', 'audio_url')
    def validate_sources(cls, v, values, **kwargs):
        # Get field name safely
        field = kwargs.get('field')
        field_name = getattr(field, 'name', None)
        
        # If we can't determine the field name, just return the value
        if not field_name:
            return v
            
        # Perform validation based on field name
        if field_name == 'video_url' and not v and not values.get('video_path'):
            raise ValueError("Either video_path or video_url must be provided")
        
        if field_name == 'audio_url' and not v and not values.get('audio_path'):
            raise ValueError("Either audio_path or audio_url must be provided")
            
        return v
    
    class Config:
        schema_extra = {
            "example": {
                "video_url": "https://example.com/video.mp4",
                "audio_url": "https://example.com/audio.mp3",
                "save_result": True
            }
        }


class LipsyncResponse(BaseModel):
    """Response model for lipsync generation."""
    request_id: str = Field(..., description="Unique ID for this request")
    status: str = Field(..., description="Status of the request (completed or error)")
    timestamp: int = Field(..., description="Unix timestamp when the request was processed")
    output_video_url: Optional[HttpUrl] = Field(None, description="URL to the generated synchronized video")
    output_video_path: Optional[str] = Field(None, description="Local path to the generated synchronized video if saved")
    local_video_url: Optional[str] = Field(None, description="Local file URL scheme for the generated video if saved")
    input: Dict[str, Any] = Field(..., description="Input parameters used for generation")
    error: Optional[str] = Field(None, description="Error message if the request failed")
    
    class Config:
        schema_extra = {
            "example": {
                "request_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
                "status": "completed",
                "timestamp": 1620000000,
                "output_video_url": "https://example.com/results/lipsync_result.mp4",
                "output_video_path": "/path/to/output/lipsync_result.mp4",
                "local_video_url": "file:///path/to/output/lipsync_result.mp4",
                "input": {
                    "video_url": "https://example.com/video.mp4",
                    "audio_url": "https://example.com/audio.mp3"
                }
            }
        }


class LipsyncDocumentationExample(BaseModel):
    """Example for API documentation."""
    url_example: LipsyncRequest = Field(
        default_factory=lambda: LipsyncRequest(
            video_url="https://example.com/video.mp4",
            audio_url="https://example.com/audio.mp3"
        ),
        description="Example using URLs"
    )
    path_example: LipsyncRequest = Field(
        default_factory=lambda: LipsyncRequest(
            video_path="/path/to/video.mp4",
            audio_path="/path/to/audio.mp3"
        ),
        description="Example using file paths"
    )
    mixed_example: LipsyncRequest = Field(
        default_factory=lambda: LipsyncRequest(
            video_url="https://example.com/video.mp4",
            audio_path="/path/to/audio.mp3"
        ),
        description="Example using mixed sources"
    ) 