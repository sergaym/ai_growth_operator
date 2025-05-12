"""
Styles-related schemas for the AI Growth Operator API.
"""

from typing import List
from pydantic import BaseModel

class StylesResponse(BaseModel):
    """Response model for available styles"""
    styles: List[str] 