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
async def refine_idea_endpoint(request: RefineIdeaRequest) -> Dict[str, Any]:
    """
    Refine an initial idea based on the target audience
    
    This endpoint can also adapt the refined idea to a different language and cultural style
    if language_settings are provided.
    """
    try:
        # Refine the idea in English first
        result = refine_idea(
            prompt_idea=request.prompt_idea,
            target_audience=request.target_audience
        )
        
        # If language settings are provided, adapt the refined idea to the target language
        if request.language_settings:
            # Store the original English refined idea
            original_refined_idea = result["refined_idea"]
            original_rationale = result["rationale"]
            
            # Convert the refinement result to a format suitable for adaptation
            idea_for_adaptation = {
                "headline": original_refined_idea,
                "tagline": "",
                "value_proposition": original_rationale,
                "key_messages": []
            }
            
            # Adapt the idea to the target language
            adapted_result = adapt_language(
                idea=idea_for_adaptation,
                target_language=request.language_settings.target_language,
                cultural_style=request.language_settings.cultural_style,
                preserve_keywords=request.language_settings.preserve_keywords,
                tone_adjustment=request.language_settings.tone_adjustment
            )
            
            # Create a new response that combines the original and adapted content
            result = {
                "refined_idea": adapted_result["headline"],
                "rationale": adapted_result["value_proposition"],
                "language": adapted_result["language"],
                "cultural_notes": adapted_result.get("cultural_notes"),
                "original_refined_idea": original_refined_idea,
                "original_rationale": original_rationale
            }
            
            if "style" in adapted_result:
                result["cultural_style"] = adapted_result["style"]
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error refining idea: {str(e)}")

@router.post("/adapt-language", response_model=LanguageAdaptResponse)
async def adapt_language_endpoint(request: LanguageAdaptRequest) -> Dict[str, Any]:
    """
    Adapt an idea to a different language and cultural style
    
    This endpoint takes a previously generated idea and adapts it to a specified language
    and optional cultural style (e.g., "Spanish with Mexican cultural style").
    
    Note: For a more streamlined experience, you can now provide language_settings directly 
    in the /generate and /refine endpoints.
    """
    try:
        result = adapt_language(
            idea=request.idea,
            target_language=request.target_language,
            cultural_style=request.cultural_style,
            preserve_keywords=request.preserve_keywords,
            tone_adjustment=request.tone_adjustment
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error adapting idea to language: {str(e)}") 