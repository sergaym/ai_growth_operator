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
    
    This endpoint can also adapt the generated idea to a different language and cultural style
    if language_settings are provided.
    """
    try:
        # Generate the idea in English first
        result = generate_idea(
            initial_idea=request.initial_idea,
            target_audience=request.target_audience,
            industry=request.industry,
            tone=request.tone,
            additional_context=request.additional_context
        )
        
        # If language settings are provided, adapt the idea to the target language
        if request.language_settings:
            # Store the original English idea
            original_idea = result.copy()
            
            # Adapt the idea to the target language
            result = adapt_language(
                idea=result,
                target_language=request.language_settings.target_language,
                cultural_style=request.language_settings.cultural_style,
                preserve_keywords=request.language_settings.preserve_keywords,
                tone_adjustment=request.language_settings.tone_adjustment
            )
            
            # Add the original English idea to the response
            result["original_idea"] = original_idea
            
            # Update the cultural style field name for consistency
            if "style" in result:
                result["cultural_style"] = result.pop("style")
        
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