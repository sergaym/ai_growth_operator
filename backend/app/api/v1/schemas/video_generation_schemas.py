"""
Video Generation Workflow schemas for API v1.
Defines request/response models for the complete video generation workflow
that orchestrates text-to-speech and lipsync operations.
"""

from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field
from enum import Enum


class WorkflowStatus(str, Enum):
    """Status of a workflow job."""
    PENDING = "pending"
    TTS_PROCESSING = "tts_processing"
    TTS_COMPLETED = "tts_completed"
    LIPSYNC_PROCESSING = "lipsync_processing"
    COMPLETED = "completed"
    ERROR = "error"


class WorkflowStepStatus(BaseModel):
    """Status of an individual step in the workflow."""
    step: str = Field(..., description="Name of the workflow step")
    status: str = Field(..., description="Status of this step")
    started_at: Optional[float] = Field(None, description="Timestamp when step started")
    completed_at: Optional[float] = Field(None, description="Timestamp when step completed")
    error: Optional[str] = Field(None, description="Error message if step failed")
    result: Optional[Dict[str, Any]] = Field(None, description="Result data from this step")


class VideoGenerationWorkflowRequest(BaseModel):
    """Request for complete video generation workflow."""
    text: str = Field(..., description="Text to convert to speech and lip-sync")
    actor_id: str = Field(..., description="ID of the actor to use for the video")
    actor_video_url: str = Field(..., description="URL of the actor's video for lipsync")
    project_id: Optional[str] = Field(None, description="Project ID to associate with this generation")
    
    # TTS settings
    voice_id: Optional[str] = Field(None, description="Specific voice ID to use for TTS")
    voice_preset: Optional[str] = Field(None, description="Voice preset name to use")
    language: Optional[str] = Field("english", description="Language for TTS generation")
    model_id: Optional[str] = Field("eleven_multilingual_v2", description="TTS model to use")
    voice_settings: Optional[Dict[str, Any]] = Field(None, description="Custom voice settings")
    
    # Lipsync settings
    save_result: Optional[bool] = Field(True, description="Whether to save the result video")
    
    # User context
    user_id: Optional[str] = Field(None, description="User ID for tracking")
    workspace_id: Optional[str] = Field(None, description="Workspace ID for organization")

