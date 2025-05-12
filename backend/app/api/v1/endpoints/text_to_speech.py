"""
Text-to-Speech endpoints for the AI Growth Operator API v1.
These endpoints handle voice listing and speech generation.
"""

from typing import List

from fastapi import APIRouter, HTTPException, Depends, Query
from fastapi.responses import FileResponse

from app.api.v1.schemas import (
    GenerateSpeechRequest,
    SpeechGenerationResponse,
    VoiceResponse,
    VoicesListResponse
)
from app.api.v1.services.text_to_speech_service import text_to_speech_service

router = APIRouter()


@router.get("/voices", response_model=VoicesListResponse, summary="List available voices")
async def list_voices():
    """
    List all available voices for text-to-speech generation.
    
    Returns:
        List of available voices with metadata.
    """
    try:
        voices_data = await text_to_speech_service.list_voices()
        voices = []
        
        for voice_data in voices_data:
            voice = VoiceResponse(
                voice_id=voice_data.get("voice_id"),
                name=voice_data.get("name"),
                description=voice_data.get("description", None),
                preview_url=voice_data.get("preview_url", None),
                languages=voice_data.get("languages", []),
                gender=voice_data.get("gender", None),
                age=voice_data.get("age", None),
                accent=voice_data.get("accent", None),
                is_cloned=voice_data.get("category", "") == "cloned",
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
    from app.api.v1.services.text_to_speech_service import VOICE_PRESETS
    
    language = language.lower()
    if language not in VOICE_PRESETS:
        available_languages = list(VOICE_PRESETS.keys())
        raise HTTPException(
            status_code=400, 
            detail=f"Language '{language}' not available. Available languages: {available_languages}"
        )
    
    return VOICE_PRESETS[language]


@router.post("/generate", response_model=SpeechGenerationResponse, summary="Generate speech from text")
async def generate_speech(request: GenerateSpeechRequest):
    """
    Generate speech from the provided text.
    
    Args:
        request: Request model containing text and voice settings
        
    Returns:
        Response with URL to the generated audio file
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
        
        result = await text_to_speech_service.generate_speech(
            text=request.text,
            voice_id=request.voice_id,
            voice_preset=request.voice_preset,
            language=request.language or "english",
            model_id=request.model_id or "eleven_multilingual_v2",
            voice_settings=voice_settings
        )
        
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
        
        # Return the response
        return SpeechGenerationResponse(
            audio_url=result["audio_url"],
            duration_seconds=None,  # Set to None as we don't calculate duration yet
            text=result["text"],
            voice_id=result["voice_id"],
            voice_name=result.get("voice_name"),
            model_id=result["model_id"]
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate speech: {str(e)}")


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