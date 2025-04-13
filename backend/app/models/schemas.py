"""
Pydantic schemas for the AI Growth Operator API.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class MarketingIdeaRequest(BaseModel):
    """Request model for marketing idea generation"""
    initial_idea: str
    target_audience: str
    industry: Optional[str] = None
    tone: Optional[str] = None
    additional_context: Optional[str] = None

class RefineIdeaRequest(BaseModel):
    """Request model for refining an initial idea"""
    prompt_idea: str
    target_audience: str
    
class RefineIdeaResponse(BaseModel):
    """Response model for idea refinement"""
    refined_idea: str
    rationale: str

class VideoPromptRequest(BaseModel):
    """Request model for video prompt generation"""
    marketing_idea: Dict[str, Any]
    visual_style: Optional[str] = None
    duration: Optional[str] = "30 seconds"
    references: Optional[List[str]] = None

class VideoPromptResponse(BaseModel):
    """Response model for video prompt generation"""
    prompt: str

class StylesResponse(BaseModel):
    """Response model for available styles"""
    styles: List[str]

class MarketingIdeaResponse(BaseModel):
    """Response model for marketing idea generation"""
    headline: str
    tagline: str
    value_proposition: str
    key_messages: List[str]
    full_response: str 