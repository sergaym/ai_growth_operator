"""
Video-related schemas for the AI Growth Operator API.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class VideoPromptRequest(BaseModel):
    """Request model for video prompt generation"""
    marketing_idea: Dict[str, Any]
    visual_style: Optional[str] = None
    duration: Optional[str] = "30 seconds"
    references: Optional[List[str]] = None

class VideoPromptResponse(BaseModel):
    """Response model for video prompt generation"""
    prompt: str 