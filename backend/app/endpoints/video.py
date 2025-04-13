"""
Video endpoints for the AI Growth Operator API
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any

from app.models.schemas import VideoPromptRequest, VideoPromptResponse
from utils.openai_utils import generate_video_prompt

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