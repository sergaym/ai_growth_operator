"""
Idea generation endpoints for v1 of the AI Growth Operator API
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any, Optional

from app.schemas import (
    IdeaRequest, 
    IdeaResponse,
    RefineIdeaRequest,
    RefineIdeaResponse,
    LanguageAdaptRequest,
    LanguageAdaptResponse
)
from app.services.openai_service import generate_idea, refine_idea, adapt_language

# Create router
router = APIRouter()

@router.post("/generate", response_model=IdeaResponse)
async def generate_idea_endpoint(request: IdeaRequest) -> Dict[str, Any]:
    """
    Generate a creative idea based on initial input
    """
    try:
        result = generate_idea(
            initial_idea=request.initial_idea,
            target_audience=request.target_audience,
            industry=request.industry,
            tone=request.tone,
            additional_context=request.additional_context
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating idea: {str(e)}")

@router.post("/refine", response_model=RefineIdeaResponse)
async def refine_idea_endpoint(request: RefineIdeaRequest) -> Dict[str, str]:
    """
    Refine an initial idea based on the target audience
    """
    try:
        result = refine_idea(
            prompt_idea=request.prompt_idea,
            target_audience=request.target_audience
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error refining idea: {str(e)}") 