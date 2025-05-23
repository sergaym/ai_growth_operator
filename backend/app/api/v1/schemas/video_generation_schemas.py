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


class WorkflowJobResponse(BaseModel):
    """Response containing job ID and status for workflow tracking."""
    job_id: str = Field(..., description="Unique identifier for the workflow job")
    status: WorkflowStatus = Field(..., description="Current status of the workflow")
    created_at: float = Field(..., description="Timestamp when job was created")
    updated_at: float = Field(..., description="Timestamp when job was last updated")
    steps: List[WorkflowStepStatus] = Field(default_factory=list, description="Status of individual workflow steps")
    current_step: Optional[str] = Field(None, description="Name of the currently executing step")
    progress_percentage: Optional[int] = Field(None, description="Overall progress percentage (0-100)")
    estimated_completion: Optional[float] = Field(None, description="Estimated completion timestamp")
    
    # Results (populated when completed)
    result: Optional[Dict[str, Any]] = Field(None, description="Final result when workflow completes")
    error: Optional[str] = Field(None, description="Error message if workflow failed")


class VideoGenerationWorkflowResponse(BaseModel):
    """Final response when video generation workflow is complete."""
    job_id: str = Field(..., description="Job ID that generated this result")
    status: WorkflowStatus = Field(..., description="Final status of the workflow")
    
    # Input context
    text: str = Field(..., description="Original text that was converted")
    actor_id: str = Field(..., description="Actor ID used")
    project_id: Optional[str] = Field(None, description="Project ID if provided")
    
    # Generated assets
    audio_url: Optional[str] = Field(None, description="URL of the generated audio")
    video_url: str = Field(..., description="URL of the final lip-synced video")
    thumbnail_url: Optional[str] = Field(None, description="URL of video thumbnail if available")
    
    # Metadata
    audio_duration: Optional[float] = Field(None, description="Duration of audio in seconds")
    video_duration: Optional[float] = Field(None, description="Duration of video in seconds")
    file_size: Optional[int] = Field(None, description="Size of the final video file in bytes")
    processing_time: Optional[float] = Field(None, description="Total processing time in seconds")
    
    # Timestamps
    created_at: float = Field(..., description="When the job was created")
    completed_at: float = Field(..., description="When the job was completed")
    
    # Steps summary
    steps: List[WorkflowStepStatus] = Field(..., description="Summary of all workflow steps")


