"""
Repository modules for the AI Growth Operator API.
This package contains modules for database access and operations.
"""

from app.repositories.video_generation_repository import (
    create_video_generation,
    update_video_generation,
    get_video_generation_by_id,
    get_video_generations
)

from app.repositories.heygen_avatar_repository import (
    create_heygen_avatar_video,
    update_heygen_avatar_video,
    get_heygen_avatar_videos
)

__all__ = [
    # Video generation
    "create_video_generation",
    "update_video_generation",
    "get_video_generation_by_id",
    "get_video_generations",
    
    # Heygen avatar videos
    "create_heygen_avatar_video",
    "update_heygen_avatar_video",
    "get_heygen_avatar_videos"
]
