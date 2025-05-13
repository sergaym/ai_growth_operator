"""
Repository classes for database operations.

This module contains repository classes that handle CRUD operations for models.
"""

from typing import Dict, List, Optional, Any, Union
from sqlalchemy.orm import Session


class ImageRepository:
    """Repository for Image model operations."""

    def create(self, data: Dict[str, Any], db: Session) -> Any:
        """
        Create a new image record in the database.
        
        Args:
            data: Dictionary containing image data
            db: Database session
            
        Returns:
            Created Image object
        """
        # Import here to avoid circular import
        from app.models import Image
        
        db_image = Image(**data)
        db.add(db_image)
        db.commit()
        db.refresh(db_image)
        return db_image
    
    def get_by_id(self, image_id: str, db: Session) -> Optional[Any]:
        """
        Get an image by ID.
        
        Args:
            image_id: ID of the image to retrieve
            db: Database session
            
        Returns:
            Image object or None if not found
        """
        # Import here to avoid circular import
        from app.models import Image
        
        return db.query(Image).filter(Image.id == image_id).first()
    
    def list_images(self, skip: int = 0, limit: int = 100, 
                   user_id: Optional[str] = None, 
                   workspace_id: Optional[str] = None, 
                   db: Session = None) -> List[Any]:
        """
        List images with optional filtering.
        
        Args:
            skip: Number of records to skip
            limit: Maximum number of records to return
            user_id: Filter by user ID
            workspace_id: Filter by workspace ID
            db: Database session
            
        Returns:
            List of Image objects
        """
        # Import here to avoid circular import
        from app.models import Image
        
        query = db.query(Image)
        
        if user_id:
            query = query.filter(Image.user_id == user_id)
        
        if workspace_id:
            query = query.filter(Image.workspace_id == workspace_id)
        
        return query.order_by(Image.created_at.desc()).offset(skip).limit(limit).all()


class VideoRepository:
    """Repository for Video model operations."""
    
    def create(self, data: Dict[str, Any], db: Session) -> Any:
        """
        Create a new video record in the database.
        
        Args:
            data: Dictionary containing video data
            db: Database session
            
        Returns:
            Created Video object
        """
        # Import here to avoid circular import
        from app.models import Video
        
        db_video = Video(**data)
        db.add(db_video)
        db.commit()
        db.refresh(db_video)
        return db_video
    
    def get_by_id(self, video_id: str, db: Session) -> Optional[Any]:
        """
        Get a video by ID.
        
        Args:
            video_id: ID of the video to retrieve
            db: Database session
            
        Returns:
            Video object or None if not found
        """
        # Import here to avoid circular import
        from app.models import Video
        
        return db.query(Video).filter(Video.id == video_id).first()


class AudioRepository:
    """Repository for Audio model operations."""
    
    def create(self, data: Dict[str, Any], db: Session) -> Any:
        """
        Create a new audio record in the database.
        
        Args:
            data: Dictionary containing audio data
            db: Database session
            
        Returns:
            Created Audio object
        """
        # Import here to avoid circular import
        from app.models import Audio
        
        db_audio = Audio(**data)
        db.add(db_audio)
        db.commit()
        db.refresh(db_audio)
        return db_audio
    
    def get_by_id(self, audio_id: str, db: Session) -> Optional[Any]:
        """
        Get an audio by ID.
        
        Args:
            audio_id: ID of the audio to retrieve
            db: Database session
            
        Returns:
            Audio object or None if not found
        """
        # Import here to avoid circular import
        from app.models import Audio
        
        return db.query(Audio).filter(Audio.id == audio_id).first()


# Create instances of repositories
image_repository = ImageRepository()
video_repository = VideoRepository()
audio_repository = AudioRepository()

# Heygen avatar video functions
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
    Create a new Heygen avatar video record in the database.
    
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
    Update an existing Heygen avatar video record.
    
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
    Get all Heygen avatar videos from the database.
    
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