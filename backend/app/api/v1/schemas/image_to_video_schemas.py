"""
Image-to-Video schemas for the AI Growth Operator API.
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, HttpUrl, validator


class GenerateVideoRequest(BaseModel):
    """Request model for generating video from an image"""
    image_url: Optional[str] = Field(
        None, 
        description="URL to an image to animate"
    )
    image_base64: Optional[str] = Field(
        None, 
        description="Base64-encoded image data"
    )
    prompt: str = Field(
        "Realistic, cinematic movement, high quality", 
        description="Text description to guide the video generation"
    )
    duration: str = Field(
        "5", 
        description="Video duration in seconds ('5' or '10')"
    )
    aspect_ratio: str = Field(
        "16:9", 
        description="Aspect ratio of the output video ('16:9', '9:16', '1:1')"
    )
    negative_prompt: str = Field(
        "blur, distort, and low quality", 
        description="What to avoid in the video"
    )
    cfg_scale: float = Field(
        0.5, 
        ge=0.0, 
        le=1.0, 
        description="How closely to follow the prompt (0.0-1.0)"
    )
    save_video: bool = Field(
        True, 
        description="Whether to save the video to disk"
    )
    
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
    
    @validator('image_url', 'image_base64', pre=True)
    def check_image_source(cls, v, values):
        # This will be checked at the API level to ensure at least one is provided
        return v


class GenerateVideoFromUrlRequest(BaseModel):
    """Request model for generating video from an image URL"""
    image_url: str = Field(..., description="URL to the image to animate")
    prompt: str = Field(
        "Realistic, cinematic movement, high quality", 
        description="Text description to guide the video generation"
    )
    duration: str = Field(
        "5", 
        description="Video duration in seconds ('5' or '10')"
    )
    aspect_ratio: str = Field(
        "16:9", 
        description="Aspect ratio of the output video ('16:9', '9:16', '1:1')"
    )
    negative_prompt: str = Field(
        "blur, distort, and low quality", 
        description="What to avoid in the video"
    )
    cfg_scale: float = Field(
        0.5, 
        ge=0.0, 
        le=1.0, 
        description="How closely to follow the prompt (0.0-1.0)"
    )
    
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

