"""
Text-to-Speech endpoints for the AI Growth Operator API v1.
These endpoints handle voice listing and speech generation.
"""

from typing import List, Dict, Any, Optional
import os
import time
import uuid

from fastapi import APIRouter, HTTPException, Depends, Query, BackgroundTasks, Path
from fastapi.responses import FileResponse

from app.api.v1.schemas import (
    GenerateSpeechRequest,
    SpeechGenerationResponse,
    VoiceResponse,
    VoicesListResponse,
    JobStatusResponse,
    AudioResponse,
    AudioListResponse
)
from app.services.text_to_speech_service import text_to_speech_service, VOICE_PRESETS
from app.db import get_db, audio_repository
from sqlalchemy.orm import Session

router = APIRouter()

# In-memory job store - in production, use Redis or a database
job_store = {}


# Background task function to process speech generation
async def process_speech_generation(
    job_id: str,
    text: str,
    voice_id: Optional[str] = None,
    voice_preset: Optional[str] = None,
    language: str = "english",
    model_id: str = "eleven_multilingual_v2",
    voice_settings: Optional[Dict[str, Any]] = None,
    output_format: str = "mp3",
    user_id: Optional[str] = None,
    workspace_id: Optional[str] = None
):
    """Process speech generation in the background."""
    try:
        # Set job status to processing
        job_store[job_id]["status"] = "processing"
        job_store[job_id]["updated_at"] = time.time()
        
        # Process the speech generation
        result = await text_to_speech_service.generate_speech(
            text=text,
            voice_id=voice_id,
            voice_preset=voice_preset,
            language=language,
            model_id=model_id,
            voice_settings=voice_settings,
            output_format=output_format,
            save_to_file=True,
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


@router.get("/voices", response_model=VoicesListResponse, summary="List available voices")
async def list_voices(
    filter_by_language: Optional[str] = Query(None, description="Filter voices by language code (e.g., 'en', 'es')"),
    filter_by_gender: Optional[str] = Query(None, description="Filter voices by gender"),
    filter_by_accent: Optional[str] = Query(None, description="Filter voices by accent")
):
    """
    List all available voices for text-to-speech generation.
    
    Args:
        filter_by_language: Optional language code to filter voices
        filter_by_gender: Optional gender to filter voices
        filter_by_accent: Optional accent to filter voices
    
    Returns:
        List of available voices with metadata.
    """
    try:
        voices_data = await text_to_speech_service.list_voices()
        voices = []
        
        # Apply optional filters
        filtered_voices = voices_data
        
        if filter_by_language:
            filtered_voices = [
                v for v in filtered_voices
                if "languages" in v and any(lang.lower() == filter_by_language.lower() for lang in v["languages"])
            ]
        
        if filter_by_gender:
            filtered_voices = [
                v for v in filtered_voices
                if "gender" in v and v["gender"].lower() == filter_by_gender.lower()
            ]
        
        if filter_by_accent:
            filtered_voices = [
                v for v in filtered_voices
                if "accent" in v and v["accent"].lower() == filter_by_accent.lower()
            ]
        
        # Convert to response model
        for voice_data in filtered_voices:
            # Get languages if available
            languages = voice_data.get("languages", [])
            
            # Get labels data
            gender = voice_data.get("gender", None)
            age = voice_data.get("age", None)
            accent = voice_data.get("accent", None)
            
            # Create voice response object
            voice = VoiceResponse(
                voice_id=voice_data.get("voice_id"),
                name=voice_data.get("name"),
                description=voice_data.get("description", None),
                preview_url=voice_data.get("preview_url", None),
                languages=languages,
                gender=gender,
                age=age,
                accent=accent,
                is_cloned=voice_data.get("category", "") == "cloned",
                category=voice_data.get("category", None),
                default_settings=voice_data.get("default_settings", None),
                labels=voice_data.get("labels", None)
            )
            voices.append(voice)
        
        return VoicesListResponse(voices=voices)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list voices: {str(e)}")


@router.get("/voices/presets", response_model=dict, summary="List voice presets")
async def list_voice_presets(language: str = Query("english", description="Language to get presets for")):
    """
    List all available voice presets for a specific language.
    
    Args:
        language: Language to get presets for (e.g., 'english', 'spanish')
        
    Returns:
        Dictionary of preset names mapped to voice IDs.
    """
    
    language = language.lower()
    if language not in VOICE_PRESETS:
        available_languages = list(VOICE_PRESETS.keys())
        raise HTTPException(
            status_code=400, 
            detail=f"Language '{language}' not available. Available languages: {available_languages}"
        )
    
    return VOICE_PRESETS[language]


@router.post("/generate", response_model=JobStatusResponse, summary="Generate speech from text")
async def generate_speech(request: GenerateSpeechRequest, background_tasks: BackgroundTasks):
    """
    Generate speech from the provided text.
    
    This endpoint immediately returns a job ID and processes the speech generation in the background.
    Use the /status/{job_id} endpoint to check the status of the job.
    
    Args:
        request: Request model containing text and voice settings
        
    Returns:
        Dictionary with job ID and initial status
    """
    try:
        # Extract voice settings if provided
        voice_settings = None
        if request.voice_settings:
            voice_settings = {
                "stability": request.voice_settings.stability,
                "similarity_boost": request.voice_settings.similarity_boost,
                "style": request.voice_settings.style,
                "use_speaker_boost": request.voice_settings.use_speaker_boost
            }
        
        # Generate a unique job ID
        job_id = str(uuid.uuid4())
        
        # Create a timestamp for created_at and updated_at
        timestamp = time.time()
        
        # Create a job record
        job_store[job_id] = {
            "status": "pending",
            "created_at": timestamp,
            "updated_at": timestamp,
            "request": {
                "text": request.text,
                "voice_id": request.voice_id,
                "voice_preset": request.voice_preset,
                "language": request.language,
                "model_id": request.model_id
            }
        }
        
        # Add the task to background tasks
        background_tasks.add_task(
            process_speech_generation,
            job_id=job_id,
            text=request.text,
            voice_id=request.voice_id,
            voice_preset=request.voice_preset,
            language=request.language or "english",
            model_id=request.model_id or "eleven_multilingual_v2",
            voice_settings=voice_settings,
            user_id=request.user_id,
            workspace_id=request.workspace_id
        )
        
        # Return the job ID and status to the client
        return {
            "job_id": job_id,
            "status": "pending",
            "created_at": timestamp,
            "updated_at": timestamp,
            "message": "Speech generation started. Use /status/{job_id} to check status."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate speech: {str(e)}")


@router.get("/status/{job_id}", response_model=JobStatusResponse, summary="Get status of a speech generation job")
async def get_job_status(job_id: str):
    """
    Get the status of a speech generation job.
    
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


@router.get("/audio/{filename}", response_class=FileResponse, summary="Get generated audio file")
async def get_audio_file(filename: str):
    """
    Get a generated audio file by filename.
    
    Args:
        filename: Name of the audio file
        
    Returns:
        Audio file as a streaming response
    """
    import os
    from app.core.config import settings
    
    audio_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))), "output", "audio")
    file_path = os.path.join(audio_dir, filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Audio file not found")
    
    return FileResponse(
        path=file_path,
        media_type="audio/mpeg",
        filename=filename
    )


@router.get("/audios", response_model=AudioListResponse, summary="List all generated audios")
async def list_audios(
    db: Session = Depends(get_db),
    skip: int = Query(0, description="Number of audios to skip"),
    limit: int = Query(50, ge=1, le=100, description="Maximum number of audios to return"),
    user_id: Optional[str] = Query(None, description="Filter by user ID"),
    workspace_id: Optional[str] = Query(None, description="Filter by workspace ID"),
    status: Optional[str] = Query(None, description="Filter by status (e.g., 'completed', 'failed')"),
    sort_by: str = Query("created_at", description="Field to sort by"),
    sort_order: str = Query("desc", description="Sort order ('asc' or 'desc')")
):
    """
    Get a list of generated audio files with pagination, filtering, and sorting options.
    
    This endpoint retrieves audios from the database, allowing you to filter by user, workspace, or status.
    Results can be sorted and paginated.
    
    Args:
        skip: Number of audios to skip (for pagination)
        limit: Maximum number of audios to return
        user_id: Filter audios by user ID
        workspace_id: Filter audios by workspace ID
        status: Filter audios by status
        sort_by: Field to sort by (e.g., 'created_at', 'text')
        sort_order: Sort order ('asc' for ascending, 'desc' for descending)
        
    Returns:
        List of audios matching the criteria
    """
    # Get audios from repository
    audios = audio_repository.get_all(
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
    total = audio_repository.count(
        db=db,
        user_id=user_id,
        workspace_id=workspace_id,
        status=status
    )
    
    # Convert audio objects to dictionaries with string dates
    processed_audios = []
    for audio in audios:
        # Convert SQLAlchemy model to dict
        audio_dict = {c.name: getattr(audio, c.name) for c in audio.__table__.columns}
        
        # Convert datetime objects to strings
        if audio_dict.get('created_at'):
            audio_dict['created_at'] = audio_dict['created_at'].isoformat()
        if audio_dict.get('updated_at'):
            audio_dict['updated_at'] = audio_dict['updated_at'].isoformat()
            
        processed_audios.append(audio_dict)
    
    # Construct response with processed audios
    return AudioListResponse(
        items=processed_audios,
        total=total,
        skip=skip,
        limit=limit
    )


@router.get("/audios/{audio_id}", response_model=AudioResponse, summary="Get audio by ID")
async def get_audio(
    audio_id: str = Path(..., description="ID of the audio to retrieve"),
    db: Session = Depends(get_db)
):
    """
    Get detailed information about a specific audio by its ID.
    
    Args:
        audio_id: ID of the audio to retrieve
        
    Returns:
        Detailed audio information
    """
    audio = audio_repository.get_by_id(audio_id, db)
    if not audio:
        raise HTTPException(status_code=404, detail="Audio not found")
    
    # Convert SQLAlchemy model to dict
    audio_dict = {c.name: getattr(audio, c.name) for c in audio.__table__.columns}
    
    # Convert datetime objects to strings
    if audio_dict.get('created_at'):
        audio_dict['created_at'] = audio_dict['created_at'].isoformat()
    if audio_dict.get('updated_at'):
        audio_dict['updated_at'] = audio_dict['updated_at'].isoformat()
    
    return audio_dict 