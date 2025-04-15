"""
HeyGen avatar video generation endpoints
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import Dict, Any, List, Optional

from app.schemas import (
    # Avatar video schemas
    HeygenAvatarVideoRequest,
    HeygenVideoResponse,
    HeygenVoiceListResponse,
    HeygenAvatarResponse,
    HeygenVoiceResponse,
    # Photo Avatar schemas
    HeygenPhotoAvatarRequest,
    HeygenGeneratePhotoAvatarRequest,
    HeygenPhotoAvatarResponse,
    HeygenAvatarGroupRequest,
    HeygenCreateAvatarGroupRequest,
    HeygenTrainAvatarGroupResponse,
    HeygenGenerateAvatarLooksRequest,
    HeygenAddMotionRequest,
    HeygenAddSoundEffectRequest,
)

from app.services.heygen_service import heygen_service
