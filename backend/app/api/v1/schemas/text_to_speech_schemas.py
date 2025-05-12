"""
Text-to-speech schemas for the AI Growth Operator API.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field, HttpUrl


class VoiceSettings(BaseModel):
    """Settings for voice generation"""
    stability: float = Field(
        0.5, 
        ge=0.0, 
        le=1.0, 
        description="Voice stability (0.0-1.0): lower values are more expressive"
    )
    similarity_boost: float = Field(
        0.75, 
        ge=0.0, 
        le=1.0, 
        description="Voice similarity boost (0.0-1.0): higher values preserve voice better"
    )
    style: float = Field(
        0.0,
        ge=0.0,
        le=1.0,
        description="Style emphasis (0.0-1.0): higher values emphasize style"
    )
    use_speaker_boost: bool = Field(
        True,
        description="Whether to use speaker boost for clearer audio"
    )


class GenerateSpeechRequest(BaseModel):
    """Request model for generating speech from text"""
    text: str = Field(..., description="Text to convert to speech")
    voice_id: Optional[str] = Field(
        None, 
        description="ElevenLabs voice ID to use"
    )
    voice_preset: Optional[str] = Field(
        None,
        description="Preset voice to use (e.g., 'male_1', 'female_1')"
    )
    language: Optional[str] = Field(
        "english",
        description="Language for the speech (e.g., 'english', 'spanish')"
    )
    model_id: Optional[str] = Field(
        "eleven_multilingual_v2",
        description="ElevenLabs model ID to use"
    )
    voice_settings: Optional[VoiceSettings] = Field(
        None,
        description="Custom voice settings"
    )


class SpeechGenerationResponse(BaseModel):
    """Response model for speech generation"""
    audio_url: HttpUrl = Field(..., description="URL to the generated audio file")
    duration_seconds: Optional[float] = Field(None, description="Duration of the audio in seconds")
    text: str = Field(..., description="The text that was converted to speech")
    voice_id: str = Field(..., description="The voice ID used for generation")
    voice_name: Optional[str] = Field(None, description="The name of the voice used")
    model_id: str = Field(..., description="The model ID used for generation")


class VoiceResponse(BaseModel):
    """Response model for voice information"""
    voice_id: str = Field(..., description="Unique ID of the voice")
    name: str = Field(..., description="Name of the voice")
    description: Optional[str] = Field(None, description="Description of the voice")
    preview_url: Optional[HttpUrl] = Field(None, description="URL to a preview audio of the voice")
    languages: List[str] = Field([], description="Languages supported by this voice")
    gender: Optional[str] = Field(None, description="Gender of the voice (if applicable)")
    age: Optional[str] = Field(None, description="Age category of the voice (if applicable)")
    accent: Optional[str] = Field(None, description="Accent of the voice (if applicable)")
    is_cloned: bool = Field(False, description="Whether the voice is a custom cloned voice")


class VoicesListResponse(BaseModel):
    """Response model for listing available voices"""
    voices: List[VoiceResponse] = Field(..., description="List of available voices") 