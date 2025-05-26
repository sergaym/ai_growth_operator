from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional, Dict, Any

# ----------------
# Base Asset Schemas
# ----------------

class BaseAsset(BaseModel):
    id: str
    created_at: datetime
    updated_at: datetime
    file_path: Optional[str]
    file_url: Optional[str]
    local_url: Optional[str]
    blob_url: Optional[str]
    user_id: Optional[str]
    workspace_id: Optional[str]
    status: str
    is_public: bool
    metadata_json: Optional[Dict[str, Any]]

class BaseAssetResponse(BaseAsset):
    model_config = ConfigDict(from_attributes=True)

# ----------------
# Asset Schemas
# ----------------

class Image(BaseAsset):
    prompt: str
    negative_prompt: Optional[str]
    guidance_scale: Optional[float]
    num_inference_steps: Optional[int]
    width: Optional[int]
    height: Optional[int]
    image_format: Optional[str]

class Video(BaseAsset):
    prompt: Optional[str]
    duration: str
    aspect_ratio: str
    cfg_scale: Optional[float]
    preview_image_url: Optional[str]
    source_image_id: Optional[str]

class Audio(BaseAsset):
    text: str
    voice_id: str
    voice_name: Optional[str]
    model_id: str
    language: Optional[str]
    duration_seconds: Optional[float]
    audio_format: Optional[str]

class LipsyncVideo(BaseAsset):
    video_id: Optional[str]
    audio_id: Optional[str]

# ----------------
# Response Models
# ----------------

class ImageResponse(Image, BaseAssetResponse):
    pass

class VideoResponse(Video, BaseAssetResponse):
    pass

class AudioResponse(Audio, BaseAssetResponse):
    pass

class LipsyncVideoResponse(LipsyncVideo, BaseAssetResponse):
    pass 