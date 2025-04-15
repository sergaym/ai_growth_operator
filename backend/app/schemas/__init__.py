"""
Schema package for the AI Growth Operator API.
This module re-exports all schemas for backward compatibility.
"""

# Idea generation schemas
from .idea_schemas import (
    IdeaRequest,
    IdeaResponse,
    RefineIdeaRequest,
    RefineIdeaResponse,
    LanguageAdaptRequest,
    LanguageAdaptResponse,
)

# Marketing schemas (legacy, for backward compatibility)
from .marketing_schemas import (
    MarketingIdeaRequest,
    MarketingIdeaResponse,
)

# Video schemas
from .video_schemas import (
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
    # Photo Avatar schemas
    HeygenGeneratePhotoAvatarRequest,
    HeygenPhotoAvatarResponse,
    HeygenCreateAvatarGroupRequest,
    HeygenTrainAvatarGroupResponse,
    HeygenGenerateAvatarLooksRequest,
    HeygenAddMotionRequest,
    HeygenAddSoundEffectRequest,
)

# Styles schemas
from .styles_schemas import StylesResponse 