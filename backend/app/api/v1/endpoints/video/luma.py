"""
Luma AI video generation endpoints
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import Dict, Any

from app.schemas import (
    VideoPromptRequest, 
    VideoPromptResponse,
    GenerateVideoFromIdeaRequest,
    VideoGenerationResponse,
    GenerateVideoWithReferencesRequest,
)
from app.services.openai_service import generate_video_prompt
from app.services.luma_service import (
    generate_video, 
    check_video_status, 
    wait_for_video_completion,
    generate_video_with_references
)

# Create router
router = APIRouter()
