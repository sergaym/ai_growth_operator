"""
Configuration settings for the AI Growth Operator API.
"""

import os
from typing import List, Optional, Union

from pydantic import AnyHttpUrl, validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings."""
    
    # API Configuration
    API_V1_STR: str = "/api"
    PROJECT_NAME: str = "AI Growth Operator API"
    PROJECT_VERSION: str = "1.0.0"
    PROJECT_DESCRIPTION: str = "Backend API for AI-powered marketing campaign generation"
    
    # Security / Auth
    SECRET_KEY: Optional[str] = os.getenv("SECRET_KEY")
    ALGORITHM: Optional[str] = os.getenv("ALGORITHM")
    ACCESS_TOKEN_EXPIRE_MINUTES: Optional[int] = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))
    REFRESH_TOKEN_EXPIRE_DAYS: Optional[int] = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", 7))
    
    # CORS Configuration
    BACKEND_CORS_ORIGINS: List[Union[str, AnyHttpUrl]] = [
        "http://localhost:3000",
        "https://localhost:3000",
        "http://127.0.0.1:3000",
        "https://ai-ugc.vercel.app",
        "https://ai-growth-operator.vercel.app",
        "https://ai-ugc-git-main.vercel.app",
        "https://*.vercel.app"
    ]
    
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
    RUNWAY_API_KEY: Optional[str] = os.getenv("RUNWAY_API_KEY")
    HEYGEN_API_KEY: Optional[str] = os.getenv("HEYGEN_API_KEY")
    FAL_CLIENT_API_KEY: Optional[str] = os.getenv("FAL_CLIENT_API_KEY")
    ELEVENLABS_API_KEY: Optional[str] = os.getenv("ELEVENLABS_API_KEY")
    HEDRA_API_KEY: Optional[str] = os.getenv("HEDRA_API_KEY")
    
    # Database Configuration
    DATABASE_URL: Optional[str] = os.getenv("DATABASE_URL")
    BLOB_READ_WRITE_TOKEN: Optional[str] = os.getenv("BLOB_READ_WRITE_TOKEN")
    BLOB_STORAGE_ENDPOINT: Optional[str] = os.getenv("BLOB_STORAGE_ENDPOINT")
    BLOB_STORAGE_BUCKET: str = os.getenv("BLOB_STORAGE_BUCKET")
    BLOB_STORAGE_REGION: str = os.getenv("BLOB_STORAGE_REGION")
    
    @validator("DATABASE_URL", pre=True)
    def validate_database_url(cls, v: Optional[str]) -> Optional[str]:
        """
        Ensure database URL has the correct dialect name.
        
        PostgreSQL URLs may sometimes use 'postgres://' which is not recognized by SQLAlchemy.
        This validator corrects it to 'postgresql://'
        """
        if not v:
            return v
        
        if v.startswith("postgres://"):
            return v.replace("postgres://", "postgresql://", 1)
        
        return v
    
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
        # Use json_schema_extra instead of json_schema_extra for Pydantic V2
        json_schema_extra = {"title": "AI Growth Operator API Settings"}

# Create global settings object
settings = Settings() 