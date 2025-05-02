"""
Luma AI video generation endpoints
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import Dict, Any

from app.schemas import (
    VideoPromptRequest, 
    VideoPromptResponse,
    GenerateVideoFromIdeaRequest,
    VideoGenerationResponse,
    GenerateVideoWithReferencesRequest,
)
from app.services.openai_service import generate_video_prompt
from app.services.luma_service import (
    generate_video, 
    check_video_status, 
    wait_for_video_completion,
    generate_video_with_references
)

# Create router
router = APIRouter()

@router.post("/prompt", response_model=VideoPromptResponse)
async def create_video_prompt(request: VideoPromptRequest) -> Dict[str, str]:
    """
    Generate a video prompt based on marketing idea
    """
    try:
        result = generate_video_prompt(
            marketing_idea=request.marketing_idea,
            visual_style=request.visual_style,
            duration=request.duration,
            references=request.references
        )
        return {"prompt": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating video prompt: {str(e)}")

@router.post("/generate-from-idea", response_model=VideoGenerationResponse)
async def generate_video_from_idea(request: GenerateVideoFromIdeaRequest, background_tasks: BackgroundTasks) -> Dict[str, Any]:
    """
    Generate a video directly from an idea
    
    This endpoint takes an idea (from idea generation) and creates a video based on it.
    The video generation is asynchronous, and the response includes a generation ID
    that can be used to check the status of the generation.
    """
    try:
        # First, generate a detailed video prompt from the idea
        idea_for_prompt = {
            "headline": request.idea.get("headline", ""),
            "value_proposition": request.idea.get("value_proposition", ""),
            "target_audience": request.idea.get("target_audience", "")
        }
        
        # Check if we're dealing with an adapted idea in another language
        language = request.idea.get("language")
        if language and language.lower() != "english" and request.idea.get("original_idea"):
            # Use the original English idea for generating the prompt
            original_idea = request.idea.get("original_idea", {})
            idea_for_prompt = {
                "headline": original_idea.get("headline", ""),
                "value_proposition": original_idea.get("value_proposition", ""),
                "target_audience": original_idea.get("target_audience", "")
            }
        
        video_prompt = generate_video_prompt(
            marketing_idea=idea_for_prompt,
            visual_style=request.video_settings.visual_style,
            duration=request.video_settings.duration,
            references=request.video_settings.references
        )
        
        # Then, initiate the video generation with Luma AI
        result = generate_video(
            prompt=video_prompt,
            visual_style=request.video_settings.visual_style,
            duration=request.video_settings.duration,
            aspect_ratio=request.video_settings.aspect_ratio,
            music_type=request.video_settings.music_type,
            include_text_overlays=request.video_settings.include_text_overlays,
            media_references=[ref.dict() for ref in request.video_settings.media_references] if request.video_settings.media_references else None
        )
        
        # Add the prompt to the response
        result["prompt_used"] = video_prompt
        
        # Start a background task to wait for video completion
        # This doesn't block the API response but allows for webhook callbacks
        # or status polling by the client
        background_tasks.add_task(
            wait_for_video_completion, 
            generation_id=result["generation_id"]
        )
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating video: {str(e)}")

@router.post("/generate-with-references", response_model=VideoGenerationResponse)
async def generate_video_with_references_endpoint(
    request: GenerateVideoWithReferencesRequest, 
    background_tasks: BackgroundTasks
) -> Dict[str, Any]:
    """
    Generate a video with specific reference media (images/videos)
    
    This endpoint allows you to provide specific images or videos as references
    for style, composition, or content of the generated video. The generation is
    asynchronous, and the response includes a generation ID that can be used to
    check the status.
    """
    try:
        # Convert the media references and settings to dictionaries
        media_refs = [ref.dict() for ref in request.media_references]
        settings = request.settings.dict()
        
        # Initiate the video generation
        result = generate_video_with_references(
            prompt=request.prompt,
            media_references=media_refs,
            settings=settings
        )
        
        # Start a background task to wait for video completion
        background_tasks.add_task(
            wait_for_video_completion, 
            generation_id=result["generation_id"]
        )
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating video with references: {str(e)}")
        
@router.get("/status/{generation_id}", response_model=VideoGenerationResponse)
async def get_video_status(generation_id: str) -> Dict[str, Any]:
    """
    Check the status of a video generation
    
    Returns the current status of a video generation job, including the video URL
    if the generation is complete.
    """
    try:
        if not generation_id or len(generation_id) < 10:
            # Return a valid response for invalid IDs
            return {
                "status": "error",
                "generation_id": generation_id or "invalid",
                "prompt_used": "Invalid generation ID",
                "duration": "Unknown",
                "error": "Invalid or missing generation ID"
            }
            
        result = check_video_status(generation_id)
        return result
        
    except Exception as e:
        # Return a valid response structure even for exceptions
        error_msg = str(e)
        print(f"Error checking generation {generation_id}: {error_msg}")
        return {
            "status": "error",
            "generation_id": generation_id,
            "prompt_used": "Error retrieving prompt",
            "duration": "Unknown",
            "error": error_msg
        } 