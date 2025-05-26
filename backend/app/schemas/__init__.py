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

# Asset schemas
from app.schemas.asset_schemas import (
    BaseAsset,
    BaseAssetResponse,
    Image,
    Video,
    Audio,
    LipsyncVideo,
    ImageResponse,
    VideoResponse,
    AudioResponse,
    LipsyncVideoResponse,
)

# Video generation schemas
from app.schemas.video_generation_schemas import (
    VideoStatus,
    VideoGeneration,
    VideoGenerationResponse,
    HeygenAvatarVideo,
    HeygenAvatarVideoResponse,
)

# Workspace schemas
from app.schemas.workspace_schemas import (
    UserWorkspace,
    Workspace,
    User,
    UserWorkspaceResponse,
    WorkspaceResponse,
    UserResponse,
)

# Subscription schemas
from app.schemas.subscription_schemas import (
    SubscriptionStatus,
    InvoiceStatus,
    SubscriptionPlan,
    Subscription,
    PaymentMethod,
    Invoice,
    SubscriptionPlanResponse,
    SubscriptionResponse,
    PaymentMethodResponse,
    InvoiceResponse,
    WorkspaceWithSubscriptionResponse,
)

# User schemas (existing)
from app.schemas.user_schemas import (
    WorkspaceBase,
    WorkspaceCreate,
    WorkspaceOut,
    UserBase,
    UserCreate,
    UserOut,
    TokenResponse,
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