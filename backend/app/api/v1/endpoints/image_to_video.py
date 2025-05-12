"""
Image-to-Video endpoints for the AI Growth Operator API v1.
These endpoints handle video generation from images.
"""

import os
from typing import Optional

from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends, Query, BackgroundTasks
from fastapi.responses import FileResponse

from app.api.v1.schemas.image_to_video_schemas import (
    GenerateVideoRequest,
    GenerateVideoFromUrlRequest,
    GenerateVideoFromBase64Request,
    VideoGenerationResponse
)
from app.api.v1.services.image_to_video_service import image_to_video_service

router = APIRouter()


@router.post("/generate", response_model=VideoGenerationResponse, summary="Generate video from an image")
async def generate_video(request: GenerateVideoRequest):
    """
    Generate a video from an image using either an image URL or base64-encoded image data.
    
    Args:
        request: Request model containing image source and video generation parameters
        
    Returns:
        Response with details of the generated video
    """
    # Check that at least one image source is provided
    if not request.image_url and not request.image_base64:
        raise HTTPException(
            status_code=400,
            detail="Either image_url or image_base64 must be provided"
        )
    
    try:
        result = await image_to_video_service.generate_video(
            image_url=request.image_url,
            image_base64=request.image_base64,
            prompt=request.prompt,
            duration=request.duration,
            aspect_ratio=request.aspect_ratio,
            negative_prompt=request.negative_prompt,
            cfg_scale=request.cfg_scale,
            save_video=request.save_video
        )
        
        if result["status"] == "error":
            raise HTTPException(status_code=500, detail=result["error"])
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate video: {str(e)}")

