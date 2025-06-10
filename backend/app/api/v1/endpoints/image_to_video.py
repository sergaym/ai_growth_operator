"""
Image-to-Video endpoints for the AI Growth Operator API v1.
These endpoints handle video generation from images.

Note: The heygen_avatar_videos and video_generations tables have been removed
by migration '31ba90da303b_remove_legacy_video_tables.py'. All video data is now
consolidated in the 'videos' table.
"""

import os
import uuid
import time
from typing import Optional, Dict, Any, List

from fastapi import APIRouter, HTTPException, UploadFile, File, Form, BackgroundTasks, Query, Path, Depends
from fastapi.responses import FileResponse, JSONResponse

from app.api.v1.schemas.image_to_video_schemas import (
    GenerateVideoRequest,
    VideoGenerationResponse,
    VideoResponse,
    VideoListResponse
)
from app.services.image_to_video_service import image_to_video_service
from app.db.database import get_async_db
from app.db.repositories.video_repository import video_repository
from sqlalchemy.ext.asyncio import AsyncSession

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
    # Manual validation to prevent FastAPI validation errors with binary data
    if not file:
        return JSONResponse(
            status_code=400,
            content={"detail": "No file provided"}
        )
        
    # Validate parameters before FastAPI tries to validate
    if duration not in ["5", "10"]:
        return JSONResponse(
            status_code=400,
            content={"detail": "Duration must be '5' or '10'"}
        )
    
    if aspect_ratio not in ["16:9", "9:16", "1:1"]:
        return JSONResponse(
            status_code=400,
            content={"detail": "Aspect ratio must be '16:9', '9:16', or '1:1'"}
        )
    
    try:
        cfg_value = float(cfg_scale)
        if cfg_value < 0.0 or cfg_value > 1.0:
            return JSONResponse(
                status_code=400,
                content={"detail": "cfg_scale must be between 0.0 and 1.0"}
            )
    except (ValueError, TypeError):
        return JSONResponse(
            status_code=400,
            content={"detail": "cfg_scale must be a valid number"}
        )
    
    try:
        # Read the file content
        file_content = await file.read()
        
        # Check if the file is empty
        if not file_content:
            return JSONResponse(
                status_code=400,
                content={"detail": "Uploaded file is empty"}
            )
            
        # Check file type by magic numbers/signatures
        # PNG signature starts with bytes [137, 80, 78, 71]
        # JPEG signature starts with bytes [255, 216]
        if not (file_content.startswith(b'\x89PNG') or 
                file_content.startswith(b'\xff\xd8') or
                file_content.startswith(b'RIFF') and b'WEBP' in file_content[:12]):  # WEBP
            return JSONResponse(
                status_code=415,
                content={"detail": "File must be a valid PNG, JPEG, or WEBP image"}
            )
        
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
            cfg_scale=cfg_value,
            user_id=user_id,
            workspace_id=workspace_id
        )
        
        # Return the job ID and status to the client
        return {
            "job_id": job_id,
            "status": "pending",
            "message": "Video generation started. Use /status/{job_id} to check status."
        }
        
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"detail": f"Failed to process image upload: {str(e)}"}
        )


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


@router.get("/videos", response_model=VideoListResponse, summary="List all generated videos")
async def list_videos(
    db: AsyncSession = Depends(get_async_db),
    skip: int = Query(0, description="Number of videos to skip"),
    limit: int = Query(50, ge=1, le=100, description="Maximum number of videos to return"),
    user_id: Optional[str] = Query(None, description="Filter by user ID"),
    workspace_id: Optional[str] = Query(None, description="Filter by workspace ID"),
    status: Optional[str] = Query(None, description="Filter by status (e.g., 'completed', 'error')"),
    sort_by: str = Query("created_at", description="Field to sort by"),
    sort_order: str = Query("desc", description="Sort order ('asc' or 'desc')")
):
    """
    Get a list of generated videos with pagination, filtering, and sorting options.
    
    This endpoint retrieves videos from the database, allowing you to filter by user, workspace, or status.
    Results can be sorted and paginated.
    
    Args:
        skip: Number of videos to skip (for pagination)
        limit: Maximum number of videos to return
        user_id: Filter videos by user ID
        workspace_id: Filter videos by workspace ID
        status: Filter videos by status
        sort_by: Field to sort by (e.g., 'created_at', 'prompt')
        sort_order: Sort order ('asc' for ascending, 'desc' for descending)
        
    Returns:
        List of videos matching the criteria
    """
    # Get videos from repository
    videos = await video_repository.get_all(
        db=db,
        skip=skip,
        limit=limit,
        user_id=user_id,
        workspace_id=workspace_id,
        status=status,
        sort_by=sort_by,
        sort_order=sort_order
    )
    
    # Get total count for pagination info
    total = await video_repository.count(
        db=db,
        user_id=user_id,
        workspace_id=workspace_id,
        status=status
    )
    
    # Convert video objects to dictionaries with string dates
    processed_videos = []
    for video in videos:
        # Convert SQLAlchemy model to dict
        video_dict = {c.name: getattr(video, c.name) for c in video.__table__.columns}
        
        # Convert datetime objects to strings
        if video_dict.get('created_at'):
            video_dict['created_at'] = video_dict['created_at'].isoformat()
        if video_dict.get('updated_at'):
            video_dict['updated_at'] = video_dict['updated_at'].isoformat()
            
        processed_videos.append(video_dict)
    
    # Construct response with processed videos
    return VideoListResponse(
        items=processed_videos,
        total=total,
        skip=skip,
        limit=limit
    )


@router.get("/videos/{video_id}", response_model=VideoResponse, summary="Get video by ID")
async def get_video(
    video_id: str = Path(..., description="ID of the video to retrieve"),
    db: AsyncSession = Depends(get_async_db)
):
    """
    Get detailed information about a specific video by its ID.
    
    Args:
        video_id: ID of the video to retrieve
        
    Returns:
        Detailed video information
    """
    video = await video_repository.get_by_id(video_id, db)
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    
    # Convert SQLAlchemy model to dict
    video_dict = {c.name: getattr(video, c.name) for c in video.__table__.columns}
    
    # Convert datetime objects to strings
    if video_dict.get('created_at'):
        video_dict['created_at'] = video_dict['created_at'].isoformat()
    if video_dict.get('updated_at'):
        video_dict['updated_at'] = video_dict['updated_at'].isoformat()
    
    return video_dict 