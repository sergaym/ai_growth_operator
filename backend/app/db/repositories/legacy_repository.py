"""
Legacy repository functions that are kept for backward compatibility.

IMPORTANT: These functions are deprecated and will be removed in a future release.
They interact with tables that are scheduled for removal.
"""

from typing import Dict, List, Optional, Any, Union
from sqlalchemy.orm import Session


def create_heygen_avatar_video(
    generation_id: str,
    prompt: str,
    avatar_id: str, 
    voice_id: str,
    background_color: str = "#f6f6fc",
    width: int = 1280,
    height: int = 720,
    voice_speed: float = 1.0,
    voice_pitch: int = 0,
    avatar_style: str = "normal",
    callback_url: Optional[str] = None,
) -> Dict[str, Any]:
    """
    DEPRECATED: Create a new Heygen avatar video record in the database.
    
    Args:
        generation_id: Unique ID from Heygen API
        prompt: Text prompt for the video
        avatar_id: Heygen avatar ID
        voice_id: Heygen voice ID
        background_color: Background color (hex)
        width: Video width
        height: Video height
        voice_speed: Voice speed
        voice_pitch: Voice pitch
        avatar_style: Avatar style
        callback_url: Callback URL for status updates
        
    Returns:
        Created video record
    """
    # Import models here to avoid circular imports
    from app.models import VideoGeneration, HeygenAvatarVideo, VideoStatus
    from app.db.database import get_db
    
    db = next(get_db())
    
    try:
        # Create base video generation record
        video_gen = VideoGeneration(
            generation_id=generation_id,
            prompt=prompt,
            status=VideoStatus.as_value(VideoStatus.PROCESSING),
            model="heygen-avatar",
            duration="0s",  # Will be updated when complete
            aspect_ratio=f"{width}:{height}",
            provider="heygen"
        )
        
        db.add(video_gen)
        db.commit()
        db.refresh(video_gen)
        
        # Create avatar-specific record
        heygen_avatar = HeygenAvatarVideo(
            video_generation_id=video_gen.id,
            avatar_id=avatar_id,
            voice_id=voice_id,
            voice_speed=voice_speed,
            voice_pitch=voice_pitch,
            width=width,
            height=height,
            background_color=background_color,
            avatar_style=avatar_style,
            callback_url=callback_url
        )
        
        db.add(heygen_avatar)
        db.commit()
        db.refresh(heygen_avatar)
        
        return {"video_gen": video_gen, "heygen_avatar": heygen_avatar}
    
    except Exception as e:
        db.rollback()
        raise e


def update_heygen_avatar_video(
    generation_id: str,
    status: Optional[str] = None,
    video_url: Optional[str] = None,
    thumbnail_url: Optional[str] = None,
    duration: Optional[str] = None,
    processing_time: Optional[float] = None,
    error_details: Optional[Dict[str, Any]] = None
) -> bool:
    """
    DEPRECATED: Update an existing Heygen avatar video record.
    
    Args:
        generation_id: Unique ID from Heygen API
        status: New status
        video_url: URL to the generated video
        thumbnail_url: URL to the video thumbnail
        duration: Video duration
        processing_time: Time taken to process the video
        error_details: Error information if generation failed
        
    Returns:
        True if update was successful
    """
    # Import models here to avoid circular imports
    from app.models import VideoGeneration, HeygenAvatarVideo
    from app.db.database import get_db
    from datetime import datetime
    
    db = next(get_db())
    
    try:
        # Find the video generation record
        video_gen = db.query(VideoGeneration).filter(
            VideoGeneration.generation_id == generation_id
        ).first()
        
        if not video_gen:
            return False
        
        # Update base video generation record
        if status:
            video_gen.status = status
        if video_url:
            video_gen.video_url = video_url
        if thumbnail_url:
            video_gen.thumbnail_url = thumbnail_url
            video_gen.preview_url = thumbnail_url  # Use thumbnail as preview
        if duration:
            video_gen.duration = duration
        
        # Add metadata
        if status == "completed":
            video_gen.completed_at = datetime.now()
        
        # Update avatar video record
        heygen_avatar = db.query(HeygenAvatarVideo).filter(
            HeygenAvatarVideo.video_generation_id == video_gen.id
        ).first()
        
        if heygen_avatar:
            if processing_time:
                heygen_avatar.processing_time = processing_time
            if error_details:
                heygen_avatar.error_details = error_details
        
        db.commit()
        return True
    
    except Exception as e:
        db.rollback()
        raise e


def get_heygen_avatar_videos() -> List[Dict[str, Any]]:
    """
    DEPRECATED: Get all Heygen avatar videos from the database.
    
    Returns:
        List of dictionaries with video information
    """
    # Import models here to avoid circular imports
    from app.models import VideoGeneration, HeygenAvatarVideo
    from app.db.database import get_db
    from sqlalchemy.orm import joinedload
    
    db = next(get_db())
    
    try:
        results = []
        query = db.query(VideoGeneration, HeygenAvatarVideo).join(
            HeygenAvatarVideo, 
            VideoGeneration.id == HeygenAvatarVideo.video_generation_id
        ).order_by(VideoGeneration.created_at.desc())
        
        for vg, ha in query:
            results.append({
                "id": vg.id,
                "generation_id": vg.generation_id,
                "prompt": vg.prompt,
                "status": vg.status,
                "video_url": vg.video_url,
                "thumbnail_url": vg.thumbnail_url,
                "created_at": vg.created_at.isoformat(),
                "avatar_id": ha.avatar_id,
                "avatar_name": ha.avatar_name,
                "voice_id": ha.voice_id,
                "processing_time": ha.processing_time
            })
        
        return results
    
    except Exception as e:
        raise e 