"""
Database and storage module.
Provides async-only database access patterns for high performance.
"""

from app.db.database import (
    # Async database functions
    get_db, get_async_db, get_session, save_to_db, update_db_object, Base,
    # Health checks and monitoring
    check_database_health, get_engine_info,
    # Engine management
    close_database_engine
)
from app.db.blob_storage import (
    upload_file, 
    download_file, 
    delete_file, 
    list_files,
    validate_asset,
    get_asset_path,
    AssetType,
)
from app.db.repositories import (
    image_repository, 
    video_repository, 
    audio_repository,
    lipsync_repository,
    create_heygen_avatar_video,
    update_heygen_avatar_video,
    get_heygen_avatar_videos
)

# Models are now imported directly from app.models

__all__ = [
    # Async database core
    "get_db",
    "get_async_db",
    "get_session",
    "save_to_db", 
    "update_db_object",
    "Base",
    
    # Health checks and monitoring
    "check_database_health",
    "get_engine_info",
    
    # Engine management
    "close_database_engine",
    
    # Blob storage
    "upload_file",
    "download_file",
    "delete_file",
    "list_files",
    "validate_asset",
    "get_asset_path",
    "AssetType",
    
    # Legacy repositories
    "image_repository",
    "video_repository",
    "audio_repository",
    "lipsync_repository",
    "create_heygen_avatar_video",
    "update_heygen_avatar_video",
    "get_heygen_avatar_videos"
] 