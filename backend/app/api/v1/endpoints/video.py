"""
Video endpoints for v1 of the AI Growth Operator API
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import Dict, Any

from app.schemas import (
    VideoPromptRequest, 
    VideoPromptResponse,
    GenerateVideoFromIdeaRequest,
    VideoGenerationResponse,
    GenerateVideoWithReferencesRequest,
    MediaReference
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