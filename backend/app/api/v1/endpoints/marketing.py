"""
Marketing endpoints for v1 of the AI Growth Operator API
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any

from app.models.schemas import MarketingIdeaRequest, MarketingIdeaResponse
from app.services.openai_service import generate_marketing_idea

# Create router
router = APIRouter()

@router.post("/idea", response_model=MarketingIdeaResponse)
async def create_marketing_idea(request: MarketingIdeaRequest) -> Dict[str, Any]:
    """
    Generate a marketing campaign idea based on initial input
    """
    try:
        result = generate_marketing_idea(
            initial_idea=request.initial_idea,
            target_audience=request.target_audience,
            industry=request.industry,
            tone=request.tone,
            additional_context=request.additional_context
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating marketing idea: {str(e)}") 