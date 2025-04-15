"""
Repository for Heygen avatar video database operations.
This module provides functions to interact with the heygen_avatar_videos table.
"""

import logging
from typing import Dict, Any, List, Optional
from datetime import datetime

from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from app.models import HeygenAvatarVideo, VideoGeneration, VideoStatus
from app.db.database import save_to_db, update_db_object
from app.repositories.video_generation_repository import create_video_generation, update_video_generation

# Configure logging
logger = logging.getLogger(__name__)

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
    avatar_name: Optional[str] = None,
    session: Optional[Session] = None
) -> Optional[Dict[str, Any]]:
    """
    Create a new Heygen avatar video record including the base video generation.
    
    Args:
        generation_id: Unique ID for the generation
        prompt: Text prompt used for the video
        avatar_id: ID of the avatar
        voice_id: ID of the voice
        background_color: Background color in hex format
        width: Video width in pixels
        height: Video height in pixels
        voice_speed: Voice speed (0.5-1.5)
        voice_pitch: Voice pitch (-50 to 50)
        avatar_style: Avatar style (normal, circle, closeUp)
        callback_url: Optional URL for callbacks
        avatar_name: Optional name of the avatar
        session: Optional database session
        
    Returns:
        Dictionary with generation_id and status, or None if creation failed
    """
    db = session
    close_session = False
    
    if db is None:
        from app.db.database import SessionLocal
        db = SessionLocal()
        close_session = True
    
    try:
        # Calculate aspect ratio
        aspect_ratio = f"{width}:{height}"
        
        # First create the base video generation record
        video_gen = create_video_generation(
            generation_id=generation_id,
            prompt=prompt,
            status=VideoStatus.as_value(VideoStatus.PROCESSING),
            model=f"heygen_avatar",
            duration="variable",  # Will be updated when completed
            aspect_ratio=aspect_ratio,
            provider="heygen",
            metadata={
                "avatar_id": avatar_id,
                "voice_id": voice_id,
                "avatar_style": avatar_style
            }
        )
        
        if not video_gen:
            logger.error(f"Failed to create base video generation record for HeygenAvatarVideo {generation_id}")
            return None
            
        # Now create the avatar-specific record
        avatar_video = HeygenAvatarVideo(
            video_generation_id=video_gen.id,
            avatar_id=avatar_id,
            avatar_name=avatar_name,
            avatar_style=avatar_style,
            voice_id=voice_id,
            voice_speed=voice_speed,
            voice_pitch=voice_pitch,
            width=width,
            height=height,
            background_color=background_color,
            callback_url=callback_url
        )
        
        db.add(avatar_video)
        db.commit()
        db.refresh(avatar_video)
        
        return {
            "generation_id": generation_id,
            "status": "processing",
            "avatar_video_id": avatar_video.id
        }
        
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Database error creating HeygenAvatarVideo: {str(e)}")
        return None
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating HeygenAvatarVideo: {str(e)}")
        return None
    finally:
        if close_session and db:
            db.close()

def update_heygen_avatar_video(
    generation_id: str,
    status: Optional[str] = None,
    video_url: Optional[str] = None,
    thumbnail_url: Optional[str] = None,
    duration: Optional[str] = None,
    processing_time: Optional[float] = None,
    error_details: Optional[Dict[str, Any]] = None,
    session: Optional[Session] = None,
    **kwargs
) -> Optional[Dict[str, Any]]:
    """
    Update a Heygen avatar video record.
    
    Args:
        generation_id: The ID of the generation to update
        status: New status of the video (processing, completed, failed)
        video_url: URL of the completed video
        thumbnail_url: URL of the video thumbnail
        duration: Duration of the completed video
        processing_time: Time taken to process the video
        error_details: Error information if the video failed
        session: Optional database session
        **kwargs: Additional fields to update
        
    Returns:
        The updated information, or None if update failed
    """
    db = session
    close_session = False
    
    if db is None:
        from app.db.database import SessionLocal
        db = SessionLocal()
        close_session = True
    
    try:
        # First update the base video generation
        update_data = {}
        if status:
            update_data["status"] = status
        if video_url:
            update_data["video_url"] = video_url
        if thumbnail_url:
            update_data["thumbnail_url"] = thumbnail_url
        if duration:
            update_data["duration"] = duration
            
        video_gen = update_video_generation(generation_id, session=db, **update_data)
        
        if not video_gen:
            logger.error(f"Failed to update base video generation for HeygenAvatarVideo {generation_id}")
            return None
            
        # Now update the avatar-specific record
        # First, find the avatar video record associated with this generation
        avatar_video = db.query(HeygenAvatarVideo).join(
            VideoGeneration, 
            HeygenAvatarVideo.video_generation_id == VideoGeneration.id
        ).filter(
            VideoGeneration.generation_id == generation_id
        ).first()
        
        if not avatar_video:
            logger.error(f"HeygenAvatarVideo record not found for generation_id {generation_id}")
            return None
            
        # Update the specified fields
        if processing_time is not None:
            avatar_video.processing_time = processing_time
            
        if error_details is not None:
            avatar_video.error_details = error_details
            
        # Update any additional fields
        for key, value in kwargs.items():
            if hasattr(avatar_video, key):
                setattr(avatar_video, key, value)
                
        db.commit()
        db.refresh(avatar_video)
        
        return {
            "generation_id": generation_id,
            "status": video_gen.status,
            "video_url": video_gen.video_url,
            "avatar_video_id": avatar_video.id
        }
        
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Database error updating HeygenAvatarVideo: {str(e)}")
        return None
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating HeygenAvatarVideo: {str(e)}")
        return None
    finally:
        if close_session and db:
            db.close()
            
def get_heygen_avatar_videos(
    avatar_id: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
    session: Optional[Session] = None
) -> List[Dict[str, Any]]:
    """
    Get a list of Heygen avatar videos with optional filtering.
    
    Args:
        avatar_id: Optional avatar ID to filter by
        status: Optional status to filter by
        limit: Maximum number of records to return
        offset: Offset for pagination
        session: Optional database session
        
    Returns:
        List of dictionaries with avatar video information
    """
    db = session
    close_session = False
    
    if db is None:
        from app.db.database import SessionLocal
        db = SessionLocal()
        close_session = True
    
    try:
        query = db.query(HeygenAvatarVideo, VideoGeneration).join(
            VideoGeneration,
            HeygenAvatarVideo.video_generation_id == VideoGeneration.id
        )
        
        if avatar_id:
            query = query.filter(HeygenAvatarVideo.avatar_id == avatar_id)
        
        if status:
            query = query.filter(VideoGeneration.status == status)
        
        query = query.order_by(VideoGeneration.created_at.desc())
        results = query.limit(limit).offset(offset).all()
        
        # Format the results
        formatted_results = []
        for avatar_video, video_gen in results:
            formatted_results.append({
                "id": avatar_video.id,
                "generation_id": video_gen.generation_id,
                "status": video_gen.status,
                "prompt": video_gen.prompt,
                "avatar_id": avatar_video.avatar_id,
                "avatar_name": avatar_video.avatar_name,
                "avatar_style": avatar_video.avatar_style,
                "voice_id": avatar_video.voice_id,
                "voice_speed": avatar_video.voice_speed,
                "voice_pitch": avatar_video.voice_pitch,
                "video_url": video_gen.video_url,
                "thumbnail_url": video_gen.thumbnail_url,
                "duration": video_gen.duration,
                "created_at": video_gen.created_at,
                "completed_at": video_gen.completed_at,
                "processing_time": avatar_video.processing_time
            })
            
        return formatted_results
        
    except Exception as e:
        logger.error(f"Error retrieving Heygen avatar videos: {str(e)}")
        return []
    finally:
        if close_session and db:
            db.close() 