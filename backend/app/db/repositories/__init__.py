"""
Repository package for database operations.

This module exports repositories that handle CRUD operations for database models.
"""

from .image_repository import ImageRepository, image_repository
from .video_repository import VideoRepository, video_repository
from .audio_repository import AudioRepository, audio_repository
from .lipsync_repository import LipsyncRepository, lipsync_repository
from .legacy_repository import (
    create_heygen_avatar_video,
    update_heygen_avatar_video,
    get_heygen_avatar_videos
)

# Re-export the repository instances
__all__ = [
    # Repository classes
    "ImageRepository",
    "VideoRepository",
    "AudioRepository", 
    "LipsyncRepository",
    
    # Repository instances
    "image_repository",
    "video_repository",
    "audio_repository",
    "lipsync_repository",
    
    # Legacy functions
    "create_heygen_avatar_video",
    "update_heygen_avatar_video",
    "get_heygen_avatar_videos"
] 