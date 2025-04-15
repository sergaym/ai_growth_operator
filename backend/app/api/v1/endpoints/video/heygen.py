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

@router.get("/voices", response_model=List[HeygenVoiceResponse])
async def list_heygen_voices() -> List[Dict[str, Any]]:
    """
    Get a list of available voices from Heygen
    
    Returns information about all available voices for use with avatar videos.
    """
    try:
        return heygen_service.list_voices()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing Heygen voices: {str(e)}")

@router.post("/generate-avatar-video", response_model=HeygenVideoResponse)
async def generate_heygen_avatar_video(
    request: HeygenAvatarVideoRequest,
    background_tasks: BackgroundTasks
) -> Dict[str, Any]:
    """
    Generate an avatar video using Heygen API
    
    This endpoint creates an avatar video with the specified avatar, voice, and script.
    The video generation is asynchronous, and the response includes a video ID
    that can be used to check the status of the generation.
    """
    try:
        # Generate the avatar video
        result = heygen_service.generate_avatar_video(
            prompt=request.prompt,
            avatar_id=request.avatar_id,
            voice_id=request.voice_id,
            background_color=request.background_color,
            width=request.width,
            height=request.height,
            voice_speed=request.voice_speed,
            voice_pitch=request.voice_pitch,
            avatar_style=request.avatar_style
        )
        
        # Start a background task to wait for video completion
        background_tasks.add_task(
            heygen_service.wait_for_video_completion,
            video_id=result["video_id"]
        )
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating Heygen avatar video: {str(e)}")

@router.get("/status/{video_id}", response_model=HeygenVideoResponse)
async def get_heygen_video_status(video_id: str) -> Dict[str, Any]:
    """
    Check the status of a Heygen video generation
    
    Returns the current status of a Heygen video generation job, including the video URL
    if the generation is complete.
    """
    try:
        return heygen_service.check_video_status(video_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error checking Heygen video status: {str(e)}")

# Photo Avatar endpoints

@router.post("/photo-avatar/generate", response_model=HeygenPhotoAvatarResponse)
async def generate_photo_avatar(request: HeygenGeneratePhotoAvatarRequest) -> Dict[str, Any]:
    """
    Generate AI avatar photos based on specified attributes.
    
    This endpoint creates AI-generated avatar photos with customizable attributes
    such as age, gender, ethnicity, pose, and appearance.
    """
    try:
        result = heygen_service.generate_avatar_photos(
            name=request.name,
            age=request.age,
            gender=request.gender,
            ethnicity=request.ethnicity,
            orientation=request.orientation,
            pose=request.pose,
            style=request.style,
            appearance=request.appearance
        )
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating photo avatar: {str(e)}")

@router.get("/photo-avatar/status/{generation_id}", response_model=Dict[str, Any])
async def check_photo_avatar_status(generation_id: str) -> Dict[str, Any]:
    """
    Check the status of an avatar photo generation.
    
    Returns the current status of the generation, and if completed, includes the image URLs.
    """
    try:
        return heygen_service.check_photo_generation_status(generation_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error checking photo avatar status: {str(e)}")

@router.post("/photo-avatar/group", response_model=Dict[str, Any])
async def create_avatar_group(request: HeygenCreateAvatarGroupRequest) -> Dict[str, Any]:
    """
    Create an avatar group from generated photos.
    
    This endpoint groups photos of the same subject to create an avatar group,
    which can then be trained to create avatars with different looks.
    """
    try:
        result = heygen_service.create_avatar_group(
            name=request.name,
            image_keys=request.image_keys,
            description=request.description
        )
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating avatar group: {str(e)}")

@router.post("/photo-avatar/group/{group_id}/train", response_model=HeygenTrainAvatarGroupResponse)
async def train_avatar_group(group_id: str) -> Dict[str, Any]:
    """
    Train an avatar group to create a model.
    
    This begins the training process for an avatar group, which is necessary
    before generating new looks for the avatar.
    """
    try:
        result = heygen_service.train_avatar_group(group_id)
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error training avatar group: {str(e)}")

@router.get("/photo-avatar/group/train/{job_id}", response_model=Dict[str, Any])
async def check_training_status(job_id: str) -> Dict[str, Any]:
    """
    Check the status of avatar group training.
    
    Returns the current status of the training job.
    """
    try:
        return heygen_service.check_training_status(job_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error checking training status: {str(e)}")

@router.post("/photo-avatar/looks", response_model=Dict[str, Any])
async def generate_avatar_looks(request: HeygenGenerateAvatarLooksRequest) -> Dict[str, Any]:
    """
    Generate new looks for an avatar based on a text prompt.
    
    This endpoint creates new variations of an avatar using text prompts to
    specify different clothing, backgrounds, or poses.
    """
    try:
        result = heygen_service.generate_avatar_looks(
            group_id=request.group_id,
            prompt=request.prompt,
            num_images=request.num_images
        )
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating avatar looks: {str(e)}")

@router.post("/photo-avatar/{avatar_id}/motion", response_model=Dict[str, Any])
async def add_motion_to_avatar(avatar_id: str, request: HeygenAddMotionRequest) -> Dict[str, Any]:
    """
    Add motion effect to a photo avatar.
    
    This endpoint adds animation effects like talking, nodding, or other
    movements to make the avatar more dynamic.
    """
    try:
        result = heygen_service.add_motion_to_avatar(
            avatar_id=avatar_id,
            motion_type=request.motion_type
        )
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error adding motion to avatar: {str(e)}")

@router.post("/photo-avatar/{avatar_id}/sound-effect", response_model=Dict[str, Any])
async def add_sound_effect(avatar_id: str, request: HeygenAddSoundEffectRequest) -> Dict[str, Any]:
    """
    Add sound effect to a photo avatar.
    
    This endpoint adds sound effects to enhance the avatar's presence.
    """
    try:
        result = heygen_service.add_sound_effect(
            avatar_id=avatar_id,
            sound_type=request.sound_type
        )
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error adding sound effect to avatar: {str(e)}") 