"""
Idea generation schemas for the AI Growth Operator API.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class IdeaRequest(BaseModel):
    """Request model for idea generation"""
    initial_idea: str
    target_audience: str
    industry: Optional[str] = None
    tone: Optional[str] = None
    additional_context: Optional[str] = None
