"""
Styles endpoints for v0 (legacy) of the AI Growth Operator API
"""

from fastapi import APIRouter

from app.api.v0.schemas import StylesResponse
from app.api.v0.services import get_available_styles

# Create router
router = APIRouter()

@router.get("/", response_model=StylesResponse)
async def get_styles() -> StylesResponse:
    """
    Get available video styles
    """
    styles = get_available_styles()
    return StylesResponse(styles=styles) 