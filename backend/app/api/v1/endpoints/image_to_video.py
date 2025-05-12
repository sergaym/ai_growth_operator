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


@router.post("/from-url", response_model=VideoGenerationResponse, summary="Generate video from an image URL")
async def generate_video_from_url(request: GenerateVideoFromUrlRequest):
    """
    Generate a video from an image URL.
    
    Args:
        request: Request model containing image URL and video generation parameters
        
    Returns:
        Response with details of the generated video
    """
    try:
        result = await image_to_video_service.generate_video(
            image_url=request.image_url,
            prompt=request.prompt,
            duration=request.duration,
            aspect_ratio=request.aspect_ratio,
            negative_prompt=request.negative_prompt,
            cfg_scale=request.cfg_scale
        )
        
        if result["status"] == "error":
            raise HTTPException(status_code=500, detail=result["error"])
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate video: {str(e)}")


@router.post("/from-base64", response_model=VideoGenerationResponse, summary="Generate video from base64 image data")
async def generate_video_from_base64(request: GenerateVideoFromBase64Request):
    """
    Generate a video from base64-encoded image data.
    
    Args:
        request: Request model containing base64 image data and video generation parameters
        
    Returns:
        Response with details of the generated video
    """
    try:
        result = await image_to_video_service.generate_video(
            image_base64=request.image_base64,
            prompt=request.prompt,
            duration=request.duration,
            aspect_ratio=request.aspect_ratio,
            negative_prompt=request.negative_prompt,
            cfg_scale=request.cfg_scale
        )
        
        if result["status"] == "error":
            raise HTTPException(status_code=500, detail=result["error"])
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate video: {str(e)}")


@router.post("/from-file", response_model=VideoGenerationResponse, summary="Generate video from an uploaded image")
async def generate_video_from_file(
    file: UploadFile = File(...),
    prompt: str = Form("Realistic, cinematic movement, high quality"),
    duration: str = Form("5"),
    aspect_ratio: str = Form("16:9"),
    negative_prompt: str = Form("blur, distort, and low quality"),
    cfg_scale: float = Form(0.5)
):
    """
    Generate a video from an uploaded image file.
    
    Args:
        file: Uploaded image file
        prompt: Text description to guide the video generation
        duration: Video duration in seconds ('5' or '10')
        aspect_ratio: Aspect ratio of the output video ('16:9', '9:16', '1:1')
        negative_prompt: What to avoid in the video
        cfg_scale: How closely to follow the prompt (0.0-1.0)
        
    Returns:
        Response with details of the generated video
    """
    # Validate parameters
    if duration not in ["5", "10"]:
        raise HTTPException(status_code=400, detail="Duration must be '5' or '10'")
    
    if aspect_ratio not in ["16:9", "9:16", "1:1"]:
        raise HTTPException(status_code=400, detail="Aspect ratio must be '16:9', '9:16', or '1:1'")
    
    if cfg_scale < 0.0 or cfg_scale > 1.0:
        raise HTTPException(status_code=400, detail="cfg_scale must be between 0.0 and 1.0")
    
    try:
        # Read the file content
        file_content = await file.read()
        
        # Save to temporary file
        temp_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))), "output", "temp")
        os.makedirs(temp_dir, exist_ok=True)
        
        temp_path = os.path.join(temp_dir, file.filename)
        with open(temp_path, "wb") as f:
            f.write(file_content)
        
        # Generate the video
        result = await image_to_video_service.generate_video(
            image_path=temp_path,
            prompt=prompt,
            duration=duration,
            aspect_ratio=aspect_ratio,
            negative_prompt=negative_prompt,
            cfg_scale=cfg_scale
        )
        
        # Clean up the temporary file
        os.remove(temp_path)
        
        if result["status"] == "error":
            raise HTTPException(status_code=500, detail=result["error"])
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate video: {str(e)}")

