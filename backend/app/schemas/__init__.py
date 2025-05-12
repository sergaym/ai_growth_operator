"""
Schema package for the AI Growth Operator API.
This module re-exports all schemas from versioned packages for backward compatibility.
"""

# Text-to-Image schemas (re-export from v1)
from app.api.v1.schemas.text_to_image_schemas import (
    AvatarParameters,
    GenerateImageRequest,
    GenerateAvatarRequest,
    UploadImageRequest,
    UploadImageResponse,
    ImageGenerationResponse,
)

# Legacy schemas (re-export from v0)
from app.api.v0.schemas import (
    # Idea generation schemas
    IdeaRequest,
    IdeaResponse,
    RefineIdeaRequest,
    RefineIdeaResponse,
    LanguageAdaptRequest,
    LanguageAdaptResponse,
    
    # Marketing schemas
    MarketingIdeaRequest,
    MarketingIdeaResponse,
    
    # Styles schemas
    StylesResponse,
    
    # Video schemas
    VideoPromptRequest,
    VideoPromptResponse,
    VideoGenerationSettings,
    GenerateVideoFromIdeaRequest,
    VideoGenerationResponse,
    MediaReference,
    GenerateVideoWithReferencesRequest,
    
    # Heygen schemas
    HeygenGenerateAvatarVideoRequest,
    HeygenAvatarResponse,
    HeygenVoiceResponse,
    HeygenVideoResponse,
    HeygenAvatarVideoResponse,
    
    # Photo Avatar schemas
    HeygenGeneratePhotoAvatarRequest,
    HeygenPhotoAvatarResponse,
    HeygenCreateAvatarGroupRequest,
    HeygenTrainAvatarGroupResponse,
    HeygenGenerateAvatarLooksRequest,
    HeygenAddMotionRequest,
    HeygenAddSoundEffectRequest,
) 