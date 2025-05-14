"""
Text-to-speech schemas for the AI Growth Operator API.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field, HttpUrl, validator
from enum import Enum


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
    
    class Config:
        schema_extra = {
            "example": {
                "stability": 0.5,
                "similarity_boost": 0.75,
                "style": 0.3,
                "use_speaker_boost": True
            }
        }


class Language(str, Enum):
    """Supported languages for text-to-speech"""
    ENGLISH = "english"
    SPANISH = "spanish"
    FRENCH = "french"
    GERMAN = "german"
    ITALIAN = "italian"
    PORTUGUESE = "portuguese"
    JAPANESE = "japanese"
    KOREAN = "korean"


class VoicePreset(str, Enum):
    """Common voice presets"""
    MALE_1 = "male_1"
    MALE_2 = "male_2"
    MALE_3 = "male_3"
    FEMALE_1 = "female_1"
    FEMALE_2 = "female_2"
    FEMALE_3 = "female_3"
    NEUTRAL_1 = "neutral_1"


class GenerateSpeechRequest(BaseModel):
    """Request model for generating speech from text"""
    text: str = Field(..., description="Text to convert to speech")
    voice_id: Optional[str] = Field(
        None, 
        description="ElevenLabs voice ID to use"
    )
    voice_preset: Optional[VoicePreset] = Field(
        None,
        description="Preset voice to use (e.g., 'male_1', 'female_1')"
    )
    language: Optional[Language] = Field(
        Language.ENGLISH,
        description="Language for the speech"
    )
    model_id: Optional[str] = Field(
        "eleven_multilingual_v2",
        description="ElevenLabs model ID to use"
    )
    voice_settings: Optional[VoiceSettings] = Field(
        None,
        description="Custom voice settings"
    )
    output_format: Optional[str] = Field(
        "mp3",
        description="Audio output format (mp3 or wav)"
    )
    save_to_file: Optional[bool] = Field(
        True,
        description="Whether to save the audio to a file"
    )
    user_id: Optional[str] = Field(
        None,
        description="User ID to associate with this generation"
    )
    workspace_id: Optional[str] = Field(
        None,
        description="Workspace ID to associate with this generation"
    )
    
    @validator('output_format')
    def validate_output_format(cls, v):
        if v not in ["mp3", "wav"]:
            raise ValueError("Output format must be 'mp3' or 'wav'")
        return v
    
    class Config:
        schema_extra = {
            "example": {
                "text": "Hello, welcome to our platform. How can I help you today?",
                "voice_preset": "female_1",
                "language": "english",
                "model_id": "eleven_multilingual_v2",
                "output_format": "mp3"
            }
        }


class SpeechGenerationResponse(BaseModel):
    """Response model for speech generation"""
    audio_url: Optional[str] = Field(None, description="URL to the generated audio file")
    text: str = Field(..., description="The text that was converted to speech")
    voice_id: str = Field(..., description="The voice ID used for generation")
    voice_name: Optional[str] = Field(None, description="The name of the voice used")
    model_id: str = Field(..., description="The model ID used for generation")
    status: str = Field(..., description="Status of the request (success or error)")
    timestamp: int = Field(..., description="Unix timestamp when the request was processed")
    request_id: str = Field(..., description="Unique ID for this request")
    error: Optional[str] = Field(None, description="Error message if generation failed")
    
    class Config:
        schema_extra = {
            "example": {
                "audio_url": "file:///path/to/output/speech_123456.mp3",
                "text": "Hello, welcome to our platform. How can I help you today?",
                "voice_id": "EXAVITQu4vr4xnSDxMaL",
                "voice_name": "Bella",
                "model_id": "eleven_multilingual_v2",
                "status": "success",
                "timestamp": 1620000000,
                "request_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479"
            }
        }


class JobStatusResponse(BaseModel):
    """Response model for job status"""
    job_id: str = Field(..., description="Unique ID for the job")
    status: str = Field(..., description="Status of the job: pending, processing, completed, error")
    created_at: float = Field(..., description="Unix timestamp when the job was created")
    updated_at: float = Field(..., description="Unix timestamp when the job was last updated")
    result: Optional[Dict[str, Any]] = Field(None, description="Result of the job if completed")
    error: Optional[str] = Field(None, description="Error message if job failed")
    
    class Config:
        schema_extra = {
            "example": {
                "job_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
                "status": "completed",
                "created_at": 1620000000,
                "updated_at": 1620000060,
                "result": {
                    "audio_url": "file:///path/to/output/speech_123456.mp3",
                    "text": "Hello, welcome to our platform. How can I help you today?",
                    "voice_id": "EXAVITQu4vr4xnSDxMaL",
                    "voice_name": "Bella",
                    "model_id": "eleven_multilingual_v2",
                    "status": "success",
                    "timestamp": 1620000060,
                    "request_id": "abc123"
                }
            }
        }


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
    category: Optional[str] = Field(None, description="Category of the voice (e.g., 'professional', 'generated')")
    default_settings: Optional[Dict[str, Any]] = Field(None, description="Default voice settings")
    labels: Optional[Dict[str, Any]] = Field(None, description="Additional voice labels and metadata")
    
    class Config:
        schema_extra = {
            "example": {
                "voice_id": "EXAVITQu4vr4xnSDxMaL",
                "name": "Bella",
                "description": "A friendly female voice with a warm tone",
                "preview_url": "https://example.com/voices/preview/bella.mp3",
                "languages": ["english"],
                "gender": "female",
                "age": "adult",
                "accent": "american",
                "category": "premade",
                "default_settings": {
                    "stability": 0.5,
                    "similarity_boost": 0.75,
                    "style": 0.0,
                    "use_speaker_boost": True
                }
            }
        }


class VoicesListResponse(BaseModel):
    """Response model for listing available voices"""
    voices: List[VoiceResponse] = Field(..., description="List of available voices")
    
    class Config:
        schema_extra = {
            "example": {
                "voices": [
                    {
                        "voice_id": "EXAVITQu4vr4xnSDxMaL",
                        "name": "Bella",
                        "languages": ["english"],
                        "gender": "female"
                    },
                    {
                        "voice_id": "ErXwobaYiN019PkySvjV",
                        "name": "Antoni",
                        "languages": ["english"],
                        "gender": "male"
                    }
                ]
            }
        } 