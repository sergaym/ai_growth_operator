"""
Schema package for v1 API.
This module exports all schemas for v1 of the API.
"""

from .text_to_image_schemas import (
    AvatarParameters,
    GenerateImageRequest,
    GenerateAvatarRequest,
    UploadImageRequest,
    UploadImageResponse,
    ImageGenerationResponse,
)

from .text_to_speech_schemas import (
    VoiceSettings,
    GenerateSpeechRequest,
    SpeechGenerationResponse,
    VoiceResponse,
    VoicesListResponse,
)

from .image_to_video_schemas import (
    GenerateVideoRequest,
    GenerateVideoFromUrlRequest,
    GenerateVideoFromBase64Request,
    VideoGenerationParameters,
    VideoGenerationResponse,
)

from .lipsync_schemas import (
    LipsyncRequest,
    LipsyncResponse,
    LipsyncDocumentationExample,
)

__all__ = [
    # Text-to-Image schemas
    "AvatarParameters",
    "GenerateImageRequest",
    "GenerateAvatarRequest",
    "UploadImageRequest",
    "UploadImageResponse",
    "ImageGenerationResponse",
    
    # Text-to-Speech schemas
    "VoiceSettings",
    "GenerateSpeechRequest",
    "SpeechGenerationResponse",
    "VoiceResponse",
    "VoicesListResponse",
    
    # Image-to-Video schemas
    "GenerateVideoRequest",
    "GenerateVideoFromUrlRequest",
    "GenerateVideoFromBase64Request",
    "VideoGenerationParameters",
    "VideoGenerationResponse",
    
    # Lipsync schemas
    "LipsyncRequest",
    "LipsyncResponse",
    "LipsyncDocumentationExample",
] 