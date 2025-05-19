"""
Image-to-Video endpoints for the AI Growth Operator API v1.
These endpoints handle video generation from images.
"""

import os
import uuid
import time
from typing import Optional, Dict, Any

from fastapi import APIRouter, HTTPException, UploadFile, File, Form, BackgroundTasks
from fastapi.responses import FileResponse

from app.api.v1.schemas.image_to_video_schemas import (
    GenerateVideoRequest,
    VideoGenerationResponse
)
from app.services.image_to_video_service import image_to_video_service

router = APIRouter()

# In-memory job store - in production, use Redis or a database
job_store = {}


# Background task function to process video generation
async def process_video_generation(
    job_id: str,
    image_url: Optional[str] = None,
    image_base64: Optional[str] = None,
    image_path: Optional[str] = None,
    prompt: str = "Realistic, cinematic movement, high quality",
    duration: str = "5",
    aspect_ratio: str = "16:9",
    negative_prompt: str = "blur, distort, and low quality",
    cfg_scale: float = 0.5,
    user_id: Optional[str] = None,
    workspace_id: Optional[str] = None
):
    """Process video generation in the background."""
    try:
        # Set job status to processing
        job_store[job_id]["status"] = "processing"
        job_store[job_id]["updated_at"] = time.time()
        
        # Process the video generation
        result = await image_to_video_service.generate_video(
            image_url=image_url,
            image_base64=image_base64,
            image_path=image_path,
            prompt=prompt,
            duration=duration,
            aspect_ratio=aspect_ratio,
            negative_prompt=negative_prompt,
            cfg_scale=cfg_scale,
            save_video=True,
            upload_to_blob=True,
            user_id=user_id,
            workspace_id=workspace_id
        )
        
        # Update job status with result
        job_store[job_id]["status"] = "completed" if result.get("status") != "error" else "error"
        job_store[job_id]["result"] = result
        job_store[job_id]["updated_at"] = time.time()
        
    except Exception as e:
        # Handle any exceptions
        job_store[job_id]["status"] = "error"
        job_store[job_id]["error"] = str(e)
        job_store[job_id]["updated_at"] = time.time()


@router.post("/generate", response_model=Dict[str, Any], summary="Generate video from an image")
async def generate_video(request: GenerateVideoRequest, background_tasks: BackgroundTasks):
    """
    Generate a video from an image using either an image URL or base64-encoded image data.
    
    This endpoint immediately returns a job ID and processes the video generation in the background.
    Use the /status/{job_id} endpoint to check the status of the job.
    
    Args:
        request: Request model containing image source and video generation parameters
        background_tasks: FastAPI background tasks
        
    Returns:
        Dictionary with job ID and initial status
    """
    # Check that at least one image source is provided
    if not request.image_url and not request.image_base64 and not request.image_path:
        raise HTTPException(
            status_code=400,
            detail="Either image_url or image_base64 or image_path must be provided"
        )
    
    # Generate a unique job ID
    job_id = str(uuid.uuid4())
    
    # Create a job record
    job_store[job_id] = {
        "status": "pending",
        "created_at": time.time(),
        "updated_at": time.time(),
        "request": {
            "image_url": request.image_url,
            "image_base64": "(base64 data)" if request.image_base64 else None,
            "image_path": request.image_path,
            "prompt": request.prompt,
            "duration": request.duration,
            "aspect_ratio": request.aspect_ratio
        }
    }
    
    # Add the task to the background tasks
    background_tasks.add_task(
        process_video_generation,
        job_id=job_id,
        image_url=request.image_url,
        image_base64=request.image_base64,
        image_path=request.image_path,
        prompt=request.prompt,
        duration=request.duration,
        aspect_ratio=request.aspect_ratio,
        negative_prompt=request.negative_prompt,
        cfg_scale=request.cfg_scale,
        user_id=request.user_id,
        workspace_id=request.workspace_id
    )
    
    # Return the job ID and status to the client
    return {
        "job_id": job_id,
        "status": "pending",
        "message": "Video generation started. Use /status/{job_id} to check status."
    }


@router.post("/from-file", response_model=Dict[str, Any], summary="Generate video from an uploaded image")
async def generate_video_from_file(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    prompt: str = Form("Realistic, cinematic movement, high quality"),
    duration: str = Form("5"),
    aspect_ratio: str = Form("16:9"),
    negative_prompt: str = Form("blur, distort, and low quality"),
    cfg_scale: float = Form(0.5),
    user_id: Optional[str] = Form(None),
    workspace_id: Optional[str] = Form(None)
):
    """
    Generate a video from an uploaded image file.
    
    This endpoint immediately returns a job ID and processes the video generation in the background.
    Use the /status/{job_id} endpoint to check the status of the job.
    
    Args:
        file: Uploaded image file
        prompt: Text description to guide the video generation
        duration: Video duration in seconds ('5' or '10')
        aspect_ratio: Aspect ratio of the output video ('16:9', '9:16', '1:1')
        negative_prompt: What to avoid in the video
        cfg_scale: How closely to follow the prompt (0.0-1.0)
        background_tasks: FastAPI background tasks
        
    Returns:
        Dictionary with job ID and initial status
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
        
        # Generate a unique job ID
        job_id = str(uuid.uuid4())
        
        # Create a job record
        job_store[job_id] = {
            "status": "pending",
            "created_at": time.time(),
            "updated_at": time.time(),
            "request": {
                "image_path": temp_path,
                "prompt": prompt,
                "duration": duration,
                "aspect_ratio": aspect_ratio
            }
        }
        
        # Add the task to the background tasks
        background_tasks.add_task(
            process_video_generation,
            job_id=job_id,
            image_path=temp_path,
            prompt=prompt,
            duration=duration,
            aspect_ratio=aspect_ratio,
            negative_prompt=negative_prompt,
            cfg_scale=cfg_scale,
            user_id=user_id,
            workspace_id=workspace_id
        )
        
        # Return the job ID and status to the client
        return {
            "job_id": job_id,
            "status": "pending",
            "message": "Video generation started. Use /status/{job_id} to check status."
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process image upload: {str(e)}")


@router.get("/status/{job_id}", response_model=Dict[str, Any], summary="Get status of a video generation job")
async def get_job_status(job_id: str):
    """
    Get the status of a video generation job.
    
    Args:
        job_id: ID of the job to check
        
    Returns:
        Dictionary with job status and result if completed
    """
    # Check if the job exists
    if job_id not in job_store:
        raise HTTPException(status_code=404, detail=f"Job with ID {job_id} not found")
    
    # Return the job status
    job = job_store[job_id]
    response = {
        "job_id": job_id,
        "status": job["status"],
        "created_at": job["created_at"],
        "updated_at": job["updated_at"],
    }
    
    # Add result if available
    if job["status"] == "completed" and "result" in job:
        response["result"] = job["result"]
    
    # Add error if available
    if job["status"] == "error" and "error" in job:
        response["error"] = job["error"]
    
    return response


@router.get("/videos/{filename}", response_class=FileResponse, summary="Get generated video file")
async def get_video_file(filename: str):
    """
    Get a generated video file by filename.
    
    Args:
        filename: Name of the video file
        
    Returns:
        Video file as a streaming response
    """
    video_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))), "output", "videos")
    file_path = os.path.join(video_dir, filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Video file not found")
    
    return FileResponse(
        path=file_path,
        media_type="video/mp4",
        filename=filename
    ) 