"""
Database and storage module.
"""

from app.db.database import get_db, save_to_db, update_db_object, Base
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
    create_heygen_avatar_video,
    update_heygen_avatar_video,
    get_heygen_avatar_videos
)

# Models are now imported directly from app.models

__all__ = [
    # Database core
    "get_db",
    "save_to_db",
    "update_db_object",
    "Base",
    
    # Blob storage
    "upload_file",
    "download_file",
    "delete_file",
    "list_files",
    "validate_asset",
    "get_asset_path",
    "AssetType",
    
    # Blob storage types
    "AssetType",
    
    # Repositories
    "image_repository",
    "video_repository",
    "audio_repository",
    "create_heygen_avatar_video",
    "update_heygen_avatar_video",
    "get_heygen_avatar_videos"
] 