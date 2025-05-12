"""
Video-related schemas for the AI Growth Operator API (v0 legacy).
"""

from typing import List, Dict, Any, Optional, Union
from pydantic import BaseModel, AnyHttpUrl, Field
from datetime import datetime

class MediaReference(BaseModel):
    """Reference media for video generation"""
    url: AnyHttpUrl
    type: str = Field(..., description="Type of media: 'image' or 'video'")
    weight: Optional[float] = Field(1.0, description="Influence weight of this reference (0.1-2.0)")
    description: Optional[str] = None

class VideoGenerationSettings(BaseModel):
    """Settings for video generation"""
    visual_style: Optional[str] = None  # Visual style (e.g., "cinematic", "3d_animation")
    duration: Optional[str] = "30 seconds"  # Target duration
    aspect_ratio: Optional[str] = "16:9"  # Aspect ratio of the video
    references: Optional[List[str]] = None  # Reference URLs or descriptions (text only)
    media_references: Optional[List[MediaReference]] = None  # Image/video references
    music_type: Optional[str] = None  # Type of background music
    include_text_overlays: Optional[bool] = True  # Whether to include text overlays

class VideoPromptRequest(BaseModel):
    """Request model for video prompt generation"""
    marketing_idea: Dict[str, Any]
    visual_style: Optional[str] = None
    duration: Optional[str] = "30 seconds"
    references: Optional[List[str]] = None

class VideoPromptResponse(BaseModel):
    """Response model for video prompt generation"""
    prompt: str

class GenerateVideoFromIdeaRequest(BaseModel):
    """Request model for generating a video directly from an idea"""
    idea: Dict[str, Any]  # The idea response from idea generation endpoint
    video_settings: VideoGenerationSettings
    
class VideoGenerationResponse(BaseModel):
    """Response model for video generation"""
    video_url: Optional[str] = None  # URL to the generated video
    prompt_used: Optional[str] = "No prompt available"  # The prompt used to generate the video
    duration: Optional[str] = "Unknown"  # Actual duration of the generated video
    thumbnail_url: Optional[str] = None  # URL to the video thumbnail
    generation_id: str  # Unique ID for the generation job
    status: str  # Status of the video generation (e.g., "completed", "processing")
    estimated_completion_time: Optional[str] = None  # Estimated completion time if processing
    error: Optional[str] = None  # Error message if generation failed

class GenerateVideoWithReferencesRequest(BaseModel):
    """Request model for generating a video with specific media references"""
    prompt: str  # The text prompt describing the video
    media_references: List[MediaReference]  # List of media references (images/videos)
    settings: VideoGenerationSettings  # General video settings 

# New schemas for Heygen avatar videos

class HeygenGenerateAvatarVideoRequest(BaseModel):
    """Request model for generating an avatar video with Heygen"""
    prompt: str = Field(..., description="The text for the avatar to speak")
    avatar_id: str = Field(..., description="The ID of the avatar to use")
    voice_id: str = Field(..., description="The ID of the voice to use")
    background_color: Optional[str] = Field("#f6f6fc", description="Background color in hex format")
    width: Optional[int] = Field(1280, description="Video width in pixels")
    height: Optional[int] = Field(720, description="Video height in pixels")
    voice_speed: Optional[float] = Field(1.0, description="Voice speed, between 0.5 and 1.5", ge=0.5, le=1.5)
    voice_pitch: Optional[int] = Field(0, description="Voice pitch, between -50 and 50", ge=-50, le=50)
    avatar_style: Optional[str] = Field("normal", description="Avatar style, one of 'normal', 'circle', 'closeUp'")

class HeygenAvatarResponse(BaseModel):
    """Response model for avatar information from Heygen"""
    avatar_id: str
    avatar_name: str
    gender: str
    preview_image_url: Optional[str] = None
    preview_video_url: Optional[str] = None

class HeygenVoiceResponse(BaseModel):
    """Response model for voice information from Heygen"""
    voice_id: str
    language: str
    gender: str
    name: str
    preview_audio: Optional[str] = None
    emotion_support: Optional[bool] = None
    support_interactive_avatar: Optional[bool] = None

class HeygenVideoResponse(BaseModel):
    """Response model for Heygen video generation"""
    video_id: str
    status: str = "pending"
    video_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    duration: Optional[float] = None
    error: Optional[Dict[str, Any]] = None

# Photo Avatar schemas
class HeygenGeneratePhotoAvatarRequest(BaseModel):
    """Request schema for generating photo avatar photos."""
    name: str = Field(..., description="Name for the avatar")
    age: str = Field(..., description="Age group (e.g., 'Young Adult', 'Adult', 'Senior')")
    gender: str = Field(..., description="Gender of avatar (e.g., 'Woman', 'Man')")
    ethnicity: str = Field(..., description="Ethnicity (e.g., 'Asian American', 'African American', 'European')")
    orientation: str = Field("horizontal", description="Image orientation ('horizontal' or 'vertical')")
    pose: str = Field("half_body", description="Avatar pose ('half_body', 'full_body', 'head')")
    style: str = Field("Realistic", description="Visual style ('Realistic', 'Stylized', etc.)")
    appearance: str = Field(..., description="Detailed prompt describing the avatar's appearance")

class HeygenPhotoAvatarResponse(BaseModel):
    """Response schema for photo avatar generation."""
    generation_id: str = Field(..., description="ID of the photo generation job")

class HeygenCreateAvatarGroupRequest(BaseModel):
    """Request schema for creating an avatar group."""
    name: str = Field(..., description="Name for the avatar group")
    image_keys: List[str] = Field(..., description="List of image keys from the generated photos")
    description: str = Field("", description="Optional description for the avatar group")

class HeygenTrainAvatarGroupResponse(BaseModel):
    """Response schema for training an avatar group."""
    job_id: str = Field(..., description="ID of the training job")
    group_id: str = Field(..., description="ID of the avatar group being trained")

class HeygenGenerateAvatarLooksRequest(BaseModel):
    """Request schema for generating avatar looks."""
    group_id: str = Field(..., description="ID of the trained avatar group")
    prompt: str = Field(..., description="Text description of the desired look")
    num_images: int = Field(4, description="Number of variations to generate (1-4)", ge=1, le=4)

class HeygenAddMotionRequest(BaseModel):
    """Request schema for adding motion to an avatar."""
    motion_type: str = Field(..., description="Type of motion to add ('talking', 'nodding', etc.)")

class HeygenAddSoundEffectRequest(BaseModel):
    """Request schema for adding sound effects to an avatar."""
    sound_type: str = Field(..., description="Type of sound effect to add") 

class HeygenAvatarVideoResponse(BaseModel):
    """Response model for Heygen avatar video records from the database."""
    id: int = Field(..., description="Database ID of the avatar video record")
    generation_id: str = Field(..., description="Unique generation ID from Heygen")
    status: str = Field(..., description="Status of the video generation")
    prompt: str = Field(..., description="Text prompt used for the video")
    avatar_id: str = Field(..., description="ID of the avatar used")
    avatar_name: Optional[str] = Field(None, description="Name of the avatar")
    avatar_style: str = Field(..., description="Style of the avatar presentation")
    voice_id: str = Field(..., description="ID of the voice used")
    voice_speed: float = Field(..., description="Speed of the voice used")
    voice_pitch: int = Field(..., description="Pitch of the voice used")
    video_url: Optional[str] = Field(None, description="URL to the generated video")
    thumbnail_url: Optional[str] = Field(None, description="URL to the video thumbnail")
    duration: Optional[str] = Field(None, description="Duration of the video")
    created_at: datetime = Field(..., description="When the generation was created")
    completed_at: Optional[datetime] = Field(None, description="When the generation was completed")
    processing_time: Optional[float] = Field(None, description="Time taken to process the video in seconds") 