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
