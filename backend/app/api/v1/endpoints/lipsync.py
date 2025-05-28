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
from app.services import lipsync_service

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
        
        # Log the request parameters for debugging
        logger.info(f"Processing lipsync request: video_url={request.video_url}, audio_url={request.audio_url}, user_id={request.user_id}, workspace_id={request.workspace_id}, project_id={request.project_id}")
        
        # Process the request through the service
        try:
            response = await lipsync_service.lipsync(
                video_path=request.video_path,
                video_url=request.video_url,
                audio_path=request.audio_path,
                audio_url=request.audio_url,
                save_result=request.save_result,
                user_id=request.user_id,
                workspace_id=request.workspace_id,
                project_id=request.project_id
            )
        except ValueError as ve:
            # Handle specific value errors from the service
            logger.error(f"Service value error: {str(ve)}")
            raise HTTPException(status_code=400, detail=str(ve))
        except Exception as se:
            # Handle other service errors
            logger.error(f"Service error: {type(se).__name__}: {str(se)}")
            raise HTTPException(status_code=500, detail=f"Service error: {str(se)}")
        
        # Check for errors in the response
        if response.get("status") == "error":
            error_message = response.get("error", "Unknown error")
            logger.error(f"Lipsync error in response: {error_message}")
            raise HTTPException(status_code=500, detail=error_message)
        
        # Validate response has required fields
        if not response.get("video_url"):
            logger.error(f"Missing video_url in response: {response}")
            raise HTTPException(status_code=500, detail="Service did not return a video URL")
        
        # All good, return the response
        logger.info(f"Lipsync successful, returning video URL: {response.get('video_url')}")
                
        return response
        
    except ValidationError as e:
        logger.error(f"Validation error: {str(e)}")
        raise HTTPException(status_code=422, detail=str(e))
    except ValueError as e:
        logger.error(f"Value error: {str(e)}")
        if "Invalid URL" in str(e):
            raise HTTPException(status_code=422, detail=str(e))
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        # Re-raise HTTP exceptions as they're already properly formatted
        raise
    except Exception as e:
        logger.error(f"Unexpected exception in lipsync endpoint: {type(e).__name__}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")


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
        try:
            url = await lipsync_service.upload_file(temp_path)
            # The service should now return a string, but let's ensure it
            url_str = str(url)
            logger.info(f"File uploaded successfully: {url_str}")
        except Exception as upload_error:
            logger.error(f"Error uploading file: {str(upload_error)}")
            raise HTTPException(status_code=500, detail=f"Error uploading file: {str(upload_error)}")
        
        # Return the URL response
        return {
            "url": url_str,
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