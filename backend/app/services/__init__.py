"""
Services package for external API integrations.
This package re-exports services from versioned packages for backward compatibility.
"""

# Text-to-Image service (re-export from v1)
from app.api.v1.services.text_to_image_service import text_to_image_service, TextToImageService

# Text-to-Speech service (re-export from v1)
from app.api.v1.services.text_to_speech_service import text_to_speech_service, TextToSpeechService

# Image-to-Video service (re-export from v1)
from app.api.v1.services.image_to_video_service import image_to_video_service, ImageToVideoService

# Lipsync service (re-export from v1)
from app.api.v1.services.lipsync_service import lipsync_service, LipsyncService

# Legacy services (re-export from v0)
from app.api.v0.services import (
    generate_idea,
    refine_idea,
    adapt_language,
    get_available_styles,
    generate_video_prompt,
    luma_service,
    heygen_service
)

__all__ = [
    # Text-to-Image services
    "text_to_image_service",
    "TextToImageService",
    
    # Text-to-Speech services
    "text_to_speech_service",
    "TextToSpeechService",
    
    # Image-to-Video services
    "image_to_video_service",
    "ImageToVideoService",
    
    # Lipsync services
    "lipsync_service",
    "LipsyncService",
    
    # Legacy services
    "generate_idea",
    "refine_idea",
    "adapt_language",
    "get_available_styles",
    "generate_video_prompt",
    "luma_service",
    "heygen_service"
] 