"""
Idea generation schemas for the AI Growth Operator API.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class LanguageSettings(BaseModel):
    """Settings for language adaptation"""
    target_language: str  # The target language (e.g., "Spanish", "French")
    cultural_style: Optional[str] = None  # Optional cultural style (e.g., "Mexican", "Canadian")
    preserve_keywords: Optional[List[str]] = None  # Optional keywords to preserve in original language
    tone_adjustment: Optional[str] = None  # Optional tone adjustments for the adaptation

class IdeaRequest(BaseModel):
    """Request model for idea generation"""
    initial_idea: str
    target_audience: str
    industry: Optional[str] = None
    tone: Optional[str] = None
    additional_context: Optional[str] = None
    language_settings: Optional[LanguageSettings] = None  # Optional language adaptation settings

class IdeaResponse(BaseModel):
    """Response model for idea generation"""
    headline: str
    tagline: str
    value_proposition: str
    key_messages: List[str]
    full_response: str
    language: Optional[str] = None  # The language of the response (if adapted)
    cultural_style: Optional[str] = None  # The cultural style used (if adapted)
    cultural_notes: Optional[str] = None  # Notes about cultural adaptations made (if adapted)
    original_idea: Optional[Dict[str, Any]] = None  # The original idea in English (if adapted)

class RefineIdeaRequest(BaseModel):
    """Request model for refining an initial idea"""
    prompt_idea: str
    target_audience: str
    language_settings: Optional[LanguageSettings] = None  # Optional language adaptation settings
    
class RefineIdeaResponse(BaseModel):
    """Response model for idea refinement"""
    refined_idea: str
    rationale: str
    language: Optional[str] = None  # The language of the response (if adapted)
    cultural_style: Optional[str] = None  # The cultural style used (if adapted)
    cultural_notes: Optional[str] = None  # Notes about cultural adaptations made (if adapted)
    original_refined_idea: Optional[str] = None  # The original refined idea in English (if adapted)
    original_rationale: Optional[str] = None  # The original rationale in English (if adapted)

# Keep these for backward compatibility and direct language adaptation use cases
class LanguageAdaptRequest(BaseModel):
    """Request model for adapting an idea to a different language/cultural style"""
    idea: Dict[str, Any]  # The original idea response
    target_language: str  # The target language (e.g., "Spanish", "French")
    cultural_style: Optional[str] = None  # Optional cultural style (e.g., "Mexican", "Canadian")
    preserve_keywords: Optional[List[str]] = None  # Optional keywords to preserve in original language
    tone_adjustment: Optional[str] = None  # Optional tone adjustments for the adaptation
    
class LanguageAdaptResponse(BaseModel):
    """Response model for language adaptation"""
    headline: str
    tagline: str
    value_proposition: str
    key_messages: List[str]
    cultural_notes: Optional[str] = None  # Notes about cultural adaptations made
    language: str  # The target language that was used
    style: Optional[str] = None  # The cultural style that was applied 