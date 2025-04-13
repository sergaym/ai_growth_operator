"""
Styles endpoints for the AI Growth Operator API
"""

from fastapi import APIRouter

from app.models.schemas import StylesResponse
from utils.prompt_utils import get_available_styles

# Create router
router = APIRouter()

@router.get("", response_model=StylesResponse)
async def get_styles() -> StylesResponse:
    """
    Get available video styles
    """
    styles = get_available_styles()
    return StylesResponse(styles=styles) 