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

# Create router
router = APIRouter()

@router.get("/avatars", response_model=List[HeygenAvatarResponse])
async def list_heygen_avatars() -> List[Dict[str, Any]]:
    """
    Get a list of available avatars from Heygen
    
    Returns information about all available avatars including system avatars
    and your custom avatars.
    """
    try:
        return heygen_service.list_avatars()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing Heygen avatars: {str(e)}")
