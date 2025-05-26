from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional, Dict, Any
from enum import Enum

# ----------------
# Video Generation Schemas
# ----------------

class VideoStatus(str, Enum):
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class VideoGeneration(BaseModel):
    id: int
    generation_id: str
    prompt: str
    status: VideoStatus
    model: str
    duration: str
    aspect_ratio: str
    provider: str
    video_url: Optional[str]
    preview_url: Optional[str]
    thumbnail_url: Optional[str]
    metadata_json: Optional[Dict[str, Any]]
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime]

class VideoGenerationResponse(VideoGeneration):
    model_config = ConfigDict(from_attributes=True)

# ----------------
# Heygen Avatar Video Schemas
# ----------------

class HeygenAvatarVideo(BaseModel):
    id: int
    video_generation_id: int
    avatar_id: str
    avatar_name: Optional[str]
    avatar_style: str
    voice_id: str
    voice_speed: float
    voice_pitch: int
    width: int
    height: int
    background_color: str
    processing_time: Optional[float]
    gender: Optional[str]
    language: Optional[str]
    callback_url: Optional[str]
    error_details: Optional[Dict[str, Any]]
    created_at: datetime
    updated_at: datetime

class HeygenAvatarVideoResponse(HeygenAvatarVideo):
    model_config = ConfigDict(from_attributes=True) 