"""
Lipsync API endpoints for synchronizing audio with video.
"""

import os
import base64
from typing import Dict, Any, Optional, List
from fastapi import APIRouter, HTTPException, BackgroundTasks, UploadFile, File, Form, Path, Query, Body, Depends
from pydantic import ValidationError
import logging

# Import schemas
from app.api.v1.schemas import (
    LipsyncRequest,
    LipsyncResponse,
    LipsyncDocumentationExample,
)

# Import services
from app.api.v1.services import lipsync_service

# Setup router
router = APIRouter()

# Setup logging
logger = logging.getLogger(__name__)


@router.post(
    "/generate",
    response_model=LipsyncResponse,
    summary="Generate lip-synchronized video from video and audio",
    description="""
    Synchronize a video's lip movements with the provided audio using the fal.ai latentsync model.
    
    You must provide either a video path or URL and either an audio path or URL.
    
    - Video and audio files can be specified as local paths or remote URLs
    - The service will upload local files to a temporary storage before processing
    - Results will be saved locally and a URL to access them will be provided
    """
)
async def generate_lipsync(
    request: LipsyncRequest,
    background_tasks: BackgroundTasks
):
    """Generate lip-synchronized video from the provided video and audio."""
    try:
        # Validate input parameters
        if not ((request.video_path or request.video_url) and (request.audio_path or request.audio_url)):
            raise HTTPException(
                status_code=400,
                detail="Both video and audio sources must be provided (either as paths or URLs)"
            )
        
        # Log request
        logger.info(f"Processing lipsync request: video_path={request.video_path}, video_url={request.video_url}, audio_path={request.audio_path}, audio_url={request.audio_url}")
        
        # Process the request through the service
        response = await lipsync_service.lipsync(
            video_path=request.video_path,
            video_url=request.video_url,
            audio_path=request.audio_path,
            audio_url=request.audio_url,
            save_result=request.save_result
        )
        
        # Check for errors
        if response.get("status") == "error":
            error_message = response.get("error", "Unknown error")
            logger.error(f"Lipsync error: {error_message}")
            raise HTTPException(status_code=500, detail=error_message)
        
        # Return the response
        return response
        
    except ValidationError as e:
        logger.error(f"Validation error: {str(e)}")
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.error(f"Exception in lipsync endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post(
    "/upload",
    response_model=Dict[str, Any],
    summary="Upload a file for lipsync processing",
    description="""
    Upload video or audio files to be used in lipsync generation.
    
    - Supports MP4, MOV, MP3, WAV, and other common formats
    - Returns a URL that can be used with the generate endpoint
    """
)
async def upload_file(
    file: UploadFile = File(...),
    file_type: str = Query(..., description="Type of file being uploaded (video or audio)")
):
    """Upload a file for lipsync processing."""
    try:
        # Validate file type
        if file_type not in ["video", "audio"]:
            raise HTTPException(status_code=400, detail="file_type must be either 'video' or 'audio'")
        
        # Save the file temporarily
        temp_path = f"/tmp/{file.filename}"
        with open(temp_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Upload the file using the service
        url = await lipsync_service.upload_file(temp_path)
        
        # Return the URL
        return {
            "url": url,
            "filename": file.filename,
            "file_type": file_type
        }
        
    except Exception as e:
        logger.error(f"Error uploading file: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get(
    "/examples",
    response_model=LipsyncDocumentationExample,
    summary="Get example requests for lipsync generation",
    description="Provides example payload formats for the lipsync generation endpoint"
)
async def get_examples():
    """Get example requests for lipsync generation."""
    return LipsyncDocumentationExample() 