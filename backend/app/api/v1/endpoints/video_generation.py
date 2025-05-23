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


@router.post(
    "/generate",
    response_model=WorkflowJobResponse,
    summary="Start video generation workflow",
    description="""
    Start a complete video generation workflow that:
    1. Converts text to speech using the specified voice
    2. Lip-syncs the generated audio with the actor's video
    3. Returns the final video with synchronized lip movements
    
    This endpoint starts the workflow and returns a job ID for tracking progress.
    Use the /status/{job_id} endpoint to monitor progress and get the final result.
    """
)
async def generate_video(request: VideoGenerationWorkflowRequest):
    """
    Start a video generation workflow.
    
    This endpoint orchestrates the complete flow:
    1. Text-to-Speech generation
    2. Lipsync with actor video
    3. Final video delivery
    
    Args:
        request: Video generation request with text, actor info, and settings
        
    Returns:
        Job information for tracking the workflow progress
    """
    try:
        # Validate required fields
        if not request.text.strip():
            raise HTTPException(status_code=400, detail="Text cannot be empty")
        
        if not request.actor_id:
            raise HTTPException(status_code=400, detail="Actor ID is required")
        
        if not request.actor_video_url:
            raise HTTPException(status_code=400, detail="Actor video URL is required")
        
        # Start the workflow
        job_id = await video_generation_service.start_workflow(request)
        
        # Get initial job status
        job_status = await video_generation_service.get_job_status(job_id)
        
        if not job_status:
            raise HTTPException(status_code=500, detail="Failed to create workflow job")
        
        # Return job response
        return WorkflowJobResponse(
            job_id=job_id,
            status=job_status["status"],
            created_at=job_status["created_at"],
            updated_at=job_status["updated_at"],
            steps=job_status.get("steps", []),
            current_step=job_status.get("current_step"),
            progress_percentage=job_status.get("progress_percentage", 0),
            estimated_completion=job_status.get("estimated_completion"),
            result=job_status.get("result"),
            error=job_status.get("error")
        )
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Error starting video generation workflow: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to start workflow: {str(e)}")


@router.get(
    "/status/{job_id}",
    response_model=WorkflowJobResponse,
    summary="Get video generation workflow status",
    description="""
    Get the current status of a video generation workflow job.
    
    The response includes:
    - Overall workflow status and progress
    - Individual step statuses (TTS, lipsync)
    - Final result when completed
    - Error information if failed
    """
)
async def get_workflow_status(job_id: str = Path(..., description="Job ID to check status for")):
    """
    Get the status of a video generation workflow.
    
    Args:
        job_id: The workflow job identifier
        
    Returns:
        Current status and progress information
    """
    try:
        job_status = await video_generation_service.get_job_status(job_id)
        
        if not job_status:
            raise HTTPException(status_code=404, detail=f"Job {job_id} not found")
        
        return WorkflowJobResponse(
            job_id=job_id,
            status=job_status["status"],
            created_at=job_status["created_at"],
            updated_at=job_status["updated_at"],
            steps=job_status.get("steps", []),
            current_step=job_status.get("current_step"),
            progress_percentage=job_status.get("progress_percentage", 0),
            estimated_completion=job_status.get("estimated_completion"),
            result=job_status.get("result"),
            error=job_status.get("error")
        )
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Error getting workflow status for job {job_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get job status: {str(e)}")

