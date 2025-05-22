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


