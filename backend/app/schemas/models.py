from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Optional, List, Dict, Any, Union
from enum import Enum
from decimal import Decimal

# ----------------
# Asset Schemas
# ----------------

class BaseAsset(BaseModel):
    id: str
    created_at: datetime
    updated_at: datetime
    file_path: Optional[str]
    file_url: Optional[str]
    local_url: Optional[str]
    blob_url: Optional[str]
    user_id: Optional[str]
    workspace_id: Optional[str]
    status: str
    is_public: bool
    metadata_json: Optional[Dict[str, Any]]

class Image(BaseAsset):
    prompt: str
    negative_prompt: Optional[str]
    guidance_scale: Optional[float]
    num_inference_steps: Optional[int]
    width: Optional[int]
    height: Optional[int]
    image_format: Optional[str]

class Video(BaseAsset):
    prompt: Optional[str]
    duration: str
    aspect_ratio: str
    cfg_scale: Optional[float]
    preview_image_url: Optional[str]
    source_image_id: Optional[str]

class Audio(BaseAsset):
    text: str
    voice_id: str
    voice_name: Optional[str]
    model_id: str
    language: Optional[str]
    duration_seconds: Optional[float]
    audio_format: Optional[str]

class LipsyncVideo(BaseAsset):
    video_id: Optional[str]
    audio_id: Optional[str]

# ----------------
# Video Generation Schemas
# ----------------

class VideoStatus(str, Enum):
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class VideoGeneration(BaseModel):
    id: int
    generation_id: str
    prompt: str
    status: VideoStatus
    model: str
    duration: str
    aspect_ratio: str
    provider: str
    video_url: Optional[str]
    preview_url: Optional[str]
    thumbnail_url: Optional[str]
    metadata_json: Optional[Dict[str, Any]]
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime]

# ----------------
# Heygen Avatar Video Schemas
# ----------------

class HeygenAvatarVideo(BaseModel):
    id: int
    video_generation_id: int
    avatar_id: str
    avatar_name: Optional[str]
    avatar_style: str
    voice_id: str
    voice_speed: float
    voice_pitch: int
    width: int
    height: int
    background_color: str
    processing_time: Optional[float]
    gender: Optional[str]
    language: Optional[str]
    callback_url: Optional[str]
    error_details: Optional[Dict[str, Any]]
    created_at: datetime
    updated_at: datetime

# ----------------
# User and Workspace Schemas
# ----------------

class UserWorkspace(BaseModel):
    user_id: int
    workspace_id: str
    role: str
    active: bool
    joined_at: datetime

class Workspace(BaseModel):
    id: str
    name: str
    type: str
    owner_id: int
    created_at: datetime
    updated_at: datetime
    stripe_customer_id: Optional[str] = None

class User(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str
    role: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# ----------------
# Response Models
# ----------------

class BaseAssetResponse(BaseAsset):
    class Config:
        from_attributes = True

class ImageResponse(Image, BaseAssetResponse):
    pass

class VideoResponse(Video, BaseAssetResponse):
    pass

class AudioResponse(Audio, BaseAssetResponse):
    pass

class LipsyncVideoResponse(LipsyncVideo, BaseAssetResponse):
    pass

class VideoGenerationResponse(VideoGeneration):
    class Config:
        from_attributes = True

class HeygenAvatarVideoResponse(HeygenAvatarVideo):
    class Config:
        from_attributes = True

class UserWorkspaceResponse(UserWorkspace):
    class Config:
        from_attributes = True

class WorkspaceResponse(Workspace):
    model_config = ConfigDict(from_attributes=True)

class UserResponse(User):
    model_config = ConfigDict(from_attributes=True)


# ----------------
# Subscription Models
# ----------------

class SubscriptionStatus(str, Enum):
    ACTIVE = "active"
    PAST_DUE = "past_due"
    CANCELED = "canceled"
    UNPAID = "unpaid"
    TRIALING = "trialing"
    EXPIRED = "expired"


class InvoiceStatus(str, Enum):
    DRAFT = "draft"
    OPEN = "open"
    PAID = "paid"
    UNCOLLECTIBLE = "uncollectible"
    VOID = "void"


class SubscriptionPlan(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    price: Decimal
    currency: str = "USD"
    billing_interval: str = "month"
    stripe_product_id: Optional[str] = None
    stripe_price_id: Optional[str] = None
    max_users: int
    created_at: datetime
    updated_at: datetime


class Subscription(BaseModel):
    id: int
    workspace_id: str
    plan_id: int
    status: SubscriptionStatus
    stripe_subscription_id: Optional[str] = None
    start_date: datetime
    end_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    canceled_at: Optional[datetime] = None
    metadata_json: Optional[Dict[str, Any]] = None


class PaymentMethod(BaseModel):
    id: int
    user_id: int
    workspace_id: str
    type: str
    last4: Optional[str] = None
    brand: Optional[str] = None
    exp_month: Optional[int] = None
    exp_year: Optional[int] = None
    stripe_payment_method_id: Optional[str] = None
    is_default: bool = False
    created_at: datetime
    updated_at: datetime


class Invoice(BaseModel):
    id: int
    subscription_id: int
    workspace_id: str
    amount: Decimal
    currency: str = "USD"
    status: InvoiceStatus
    stripe_invoice_id: Optional[str] = None
    invoice_pdf_url: Optional[str] = None
    invoice_date: datetime
    due_date: Optional[datetime] = None
    paid_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    metadata_json: Optional[Dict[str, Any]] = None


# ----------------
# Response Models
# ----------------

class SubscriptionPlanResponse(SubscriptionPlan):
    model_config = ConfigDict(from_attributes=True)


class SubscriptionResponse(Subscription):
    plan: SubscriptionPlanResponse
    model_config = ConfigDict(from_attributes=True)


class PaymentMethodResponse(PaymentMethod):
    model_config = ConfigDict(from_attributes=True)


class InvoiceResponse(Invoice):
    subscription: SubscriptionResponse
    model_config = ConfigDict(from_attributes=True)


class WorkspaceWithSubscriptionResponse(WorkspaceResponse):
    active_subscription: Optional[SubscriptionResponse] = None
    model_config = ConfigDict(from_attributes=True)
