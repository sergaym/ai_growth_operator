"""
Video Generation Workflow endpoints for the AI Growth Operator API v1.
These endpoints handle the complete text-to-speech + lipsync workflow.
"""

from typing import Dict, Any
from fastapi import APIRouter, HTTPException, Path
import logging

from app.api.v1.schemas import (
    VideoGenerationWorkflowRequest,
    WorkflowJobResponse,
    VideoGenerationWorkflowResponse,
    VideoGenerationDocumentationExample
)
from app.services.video_generation_service import video_generation_service

router = APIRouter()
logger = logging.getLogger(__name__)
