"""
Marketing endpoints for v1 of the AI Growth Operator API (Legacy)
This module is maintained for backward compatibility and redirects to the idea endpoints.
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any

from app.schemas import (
    MarketingIdeaRequest, 
    MarketingIdeaResponse,
    RefineIdeaRequest,
    RefineIdeaResponse
)
from app.api.v1.endpoints.idea import generate_idea_endpoint, refine_idea_endpoint

# Create router
router = APIRouter()

@router.post("/idea", response_model=MarketingIdeaResponse)
async def create_marketing_idea(request: MarketingIdeaRequest) -> Dict[str, Any]:
    """
    Generate a marketing campaign idea based on initial input
    
    Note: This endpoint is deprecated. Use /idea/generate instead.
    """
    # Redirect to the new endpoint
    return await generate_idea_endpoint(request)

@router.post("/refine", response_model=RefineIdeaResponse)
async def refine_marketing_idea(request: RefineIdeaRequest) -> Dict[str, str]:
    """
    Refine an initial idea based on the target audience
    
    Note: This endpoint is deprecated. Use /idea/refine instead.
    """
    # Redirect to the new endpoint
    return await refine_idea_endpoint(request) 