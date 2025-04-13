"""
Configuration settings for the AI Growth Operator API.
"""

import os
from typing import Any, Dict, List, Optional, Union

from pydantic import AnyHttpUrl, validator
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """Application settings."""
    
    # API Configuration
    API_V1_STR: str = "/api"
    PROJECT_NAME: str = "AI Growth Operator API"
    PROJECT_VERSION: str = "1.0.0"
    PROJECT_DESCRIPTION: str = "Backend API for AI-powered marketing campaign generation"
    
    # CORS Configuration
    BACKEND_CORS_ORIGINS: List[Union[str, AnyHttpUrl]] = ["*"]
    
    @validator("BACKEND_CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        """Parse CORS origins from various formats."""
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)
    
    # API Keys
    OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY")
    LUMAAI_API_KEY: Optional[str] = os.getenv("LUMAAI_API_KEY")
    
    # OpenAI Settings
    DEFAULT_GPT_MODEL: str = "gpt-4"
    
    # Luma AI Settings
    LUMA_DEFAULT_MODEL: str = "ray-2"
    LUMA_DEFAULT_RESOLUTION: str = "720p"
    LUMA_DEFAULT_VIDEO_DURATION: str = "5s"
    LUMA_ENABLE_LOOP: bool = True
    VIDEO_OUTPUT_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "output", "videos")
    
    # Ensure video output directory exists
    @validator("VIDEO_OUTPUT_DIR")
    def ensure_video_dir_exists(cls, v):
        os.makedirs(v, exist_ok=True)
        return v
    
    class Config:
        """Pydantic configuration class."""
        case_sensitive = True
        env_file = ".env"

# Create global settings object
settings = Settings() 