"""
Schema package for v0 (legacy) of the AI Growth Operator API.
This package contains schema definitions for v0 (legacy) API endpoints.
"""

# Import idea schemas from local file
from .idea_schemas import (
    IdeaRequest,
    IdeaResponse,
    RefineIdeaRequest,
    RefineIdeaResponse,
    LanguageAdaptRequest,
    LanguageAdaptResponse,
)

# Import marketing schemas from local file
from .marketing_schemas import (
    MarketingIdeaRequest,
    MarketingIdeaResponse,
)

# Import styles schemas from local file
from .styles_schemas import StylesResponse

# Import video schemas from local file
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

__all__ = [
    "IdeaRequest",
    "IdeaResponse",
    "RefineIdeaRequest",
    "RefineIdeaResponse",
    "LanguageAdaptRequest",
    "LanguageAdaptResponse",
    "MarketingIdeaRequest",
    "MarketingIdeaResponse",
    "StylesResponse",
    "VideoPromptRequest",
    "VideoPromptResponse",
    "VideoGenerationSettings",
    "GenerateVideoFromIdeaRequest",
    "VideoGenerationResponse",
    "MediaReference",
    "GenerateVideoWithReferencesRequest",
    "HeygenGenerateAvatarVideoRequest",
    "HeygenAvatarResponse",
    "HeygenVoiceResponse",
    "HeygenVideoResponse",
    "HeygenAvatarVideoResponse",
    "HeygenGeneratePhotoAvatarRequest",
    "HeygenPhotoAvatarResponse",
    "HeygenCreateAvatarGroupRequest",
    "HeygenTrainAvatarGroupResponse",
    "HeygenGenerateAvatarLooksRequest",
    "HeygenAddMotionRequest",
    "HeygenAddSoundEffectRequest",
] 