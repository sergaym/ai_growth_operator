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
    Language,
    VoicePreset,
    GenerateSpeechRequest,
    SpeechGenerationResponse,
    VoiceResponse,
    VoicesListResponse,
    JobStatusResponse,
    AudioResponse,
    AudioListResponse,
)

from .image_to_video_schemas import (
    GenerateVideoRequest,
    VideoGenerationResponse,
    VideoResponse,
    VideoListResponse,
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
    "Language",
    "VoicePreset",
    "GenerateSpeechRequest",
    "SpeechGenerationResponse",
    "VoiceResponse",
    "VoicesListResponse",
    "JobStatusResponse",
    "AudioResponse",
    "AudioListResponse",
    
    # Image-to-Video schemas
    "GenerateVideoRequest",
    "VideoGenerationResponse",
    "VideoResponse",
    "VideoListResponse",
    
    # Lipsync schemas
    "LipsyncRequest",
    "LipsyncResponse",
    "LipsyncDocumentationExample",
] 