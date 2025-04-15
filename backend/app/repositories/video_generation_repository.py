"""
Repository for video generation database operations.
This module provides functions to interact with the video_generations table.
"""

import logging
from typing import Dict, Any, List, Optional
from datetime import datetime

from sqlalchemy.orm import Session

from app.models import VideoGeneration, VideoStatus
from app.db.database import save_to_db, update_db_object

# Configure logging
logger = logging.getLogger(__name__)

def create_video_generation(
    generation_id: str,
    prompt: str,
    status: str = VideoStatus.PROCESSING,
    model: str = "default",
    duration: str = "30 seconds",
    aspect_ratio: str = "16:9",
    provider: str = "luma",
    **kwargs
) -> Optional[VideoGeneration]:
    """
    Create a new video generation record.
    
    Args:
        generation_id: Unique ID for the generation
        prompt: Text prompt used for the video
        status: Status of the generation (processing, completed, etc.)
        model: Model used for generation
        duration: Duration of the video
        aspect_ratio: Aspect ratio of the video
        provider: Provider of the video generation service
        **kwargs: Additional fields to store
        
    Returns:
        The created VideoGeneration object, or None if creation failed
    """
    # Always use the string value of the status
    status_value = VideoStatus.as_value(status)
    
    video_gen = VideoGeneration(
        generation_id=generation_id,
        prompt=prompt,
        status=status_value,
        model=model,
        duration=duration,
        aspect_ratio=aspect_ratio,
        provider=provider,
        **kwargs
    )
    
    return save_to_db(video_gen)

def update_video_generation(
    generation_id: str,
    session: Optional[Session] = None,
    **kwargs
) -> Optional[VideoGeneration]:
    """
    Update an existing video generation record.
    
    Args:
        generation_id: The ID of the generation to update
        session: Optional database session
        **kwargs: Fields to update
        
    Returns:
        The updated VideoGeneration object, or None if update failed
    """
    db = session
    close_session = False
    
    if db is None:
        from app.db.database import SessionLocal
        db = SessionLocal()
        close_session = True
    
    try:
        video_gen = db.query(VideoGeneration).filter(VideoGeneration.generation_id == generation_id).first()
        
        if video_gen is None:
            logger.error(f"Video generation with ID {generation_id} not found")
            return None
            
        # Update the status if provided
        if "status" in kwargs:
            # Always use the string value of the status
            status = kwargs.pop("status")
            status_value = VideoStatus.as_value(status)
            video_gen.status = status_value
            
            # Set completed_at timestamp if status is completed
            if video_gen.status == VideoStatus.as_value(VideoStatus.COMPLETED) and not video_gen.completed_at:
                video_gen.completed_at = datetime.now()
        
        # Update all other fields
        for key, value in kwargs.items():
            if hasattr(video_gen, key):
                setattr(video_gen, key, value)
        
        return update_db_object(video_gen, db)
        
    except Exception as e:
        logger.error(f"Error updating video generation: {str(e)}")
        return None
    finally:
        if close_session and db:
            db.close()
            
def get_video_generation_by_id(
    generation_id: str,
    session: Optional[Session] = None
) -> Optional[VideoGeneration]:
    """
    Get a video generation by ID.
    
    Args:
        generation_id: The ID of the generation to retrieve
        session: Optional database session
        
    Returns:
        The VideoGeneration object, or None if not found
    """
    db = session
    close_session = False
    
    if db is None:
        from app.db.database import SessionLocal
        db = SessionLocal()
        close_session = True
    
    try:
        return db.query(VideoGeneration).filter(VideoGeneration.generation_id == generation_id).first()
    except Exception as e:
        logger.error(f"Error retrieving video generation: {str(e)}")
        return None
    finally:
        if close_session and db:
            db.close()

def get_video_generations(
    provider: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
    session: Optional[Session] = None
) -> List[VideoGeneration]:
    """
    Get a list of video generations with optional filtering.
    
    Args:
        provider: Optional provider to filter by
        status: Optional status to filter by
        limit: Maximum number of records to return
        offset: Offset for pagination
        session: Optional database session
        
    Returns:
        List of VideoGeneration objects
    """
    db = session
    close_session = False
    
    if db is None:
        from app.db.database import SessionLocal
        db = SessionLocal()
        close_session = True
    
    try:
        query = db.query(VideoGeneration)
        
        if provider:
            query = query.filter(VideoGeneration.provider == provider)
        
        if status:
            query = query.filter(VideoGeneration.status == status)
        
        query = query.order_by(VideoGeneration.created_at.desc())
        return query.limit(limit).offset(offset).all()
    except Exception as e:
        logger.error(f"Error retrieving video generations: {str(e)}")
        return []
    finally:
        if close_session and db:
            db.close() 