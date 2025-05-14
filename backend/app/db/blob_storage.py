"""
Blob storage configuration and utility functions.

This module provides a unified interface for interacting with blob storage
services like S3, Vercel Blob, etc.
"""

import os
import logging
import mimetypes
from pathlib import Path
from typing import Dict, List, Optional, BinaryIO, Any, Union

from app.core.config import settings

# Configure logging
logger = logging.getLogger(__name__)

class AssetType:
    """Constants for asset types."""
    IMAGES = "images"
    AUDIO = "audio"
    VIDEOS = "videos"
    DOCUMENTS = "documents"
    TEMP = "temp"

# Asset path configuration
ASSET_PATHS = {
    AssetType.IMAGES: "images",
    AssetType.AUDIO: "audio",
    AssetType.VIDEOS: "videos",
    AssetType.DOCUMENTS: "documents",
    AssetType.TEMP: "temp"
}

# Asset type specific configurations
ASSET_CONFIGS = {
    AssetType.IMAGES: {
        "allowed_extensions": [".jpg", ".jpeg", ".png", ".webp"],
        "max_size_mb": 10,
        "content_types": ["image/jpeg", "image/png", "image/webp"]
    },
    AssetType.AUDIO: {
        "allowed_extensions": [".mp3", ".wav", ".ogg"],
        "max_size_mb": 50,
        "content_types": ["audio/mpeg", "audio/wav", "audio/ogg"]
    },
    AssetType.VIDEOS: {
        "allowed_extensions": [".mp4", ".webm", ".mov"],
        "max_size_mb": 500,
        "content_types": ["video/mp4", "video/webm", "video/quicktime"]
    },
    AssetType.DOCUMENTS: {
        "allowed_extensions": [".pdf", ".doc", ".docx", ".txt"],
        "max_size_mb": 20,
        "content_types": ["application/pdf", "application/msword", 
                         "application/vnd.openxmlformats-officedocument.wordprocessingml.document", 
                         "text/plain"]
    }
}

# Check if blob storage is configured
if settings.BLOB_READ_WRITE_TOKEN is None:
    logger.warning("BLOB_READ_WRITE_TOKEN not set in environment. Blob storage operations will be limited.")
    ENABLE_BLOB_STORAGE = False
else:
    ENABLE_BLOB_STORAGE = True

# Initialize blob storage client
blob_client = None

def _initialize_client():
    """
    Initialize the appropriate blob storage client based on configuration.
    
    Currently supports:
    - Vercel Blob (default)
    - (Could be extended to support AWS S3, Azure Blob, etc.)
    """
    global blob_client
    
    if not ENABLE_BLOB_STORAGE:
        logger.warning("Blob storage disabled: No token provided")
        return None
    
    try:
        # Dynamically import the required client
        # For now, default to Vercel Blob
        try:
            # Import specific functions, aliasing potential keywords/builtins
            from vercel_blob import put, get
            from vercel_blob import list as list_blobs # Alias to avoid conflict
            from vercel_blob import delete as delete_blob_op # Alias to avoid conflict
            
            # Simple wrapper to provide a consistent interface
            class VercelBlobClient:
                async def upload(self, file_content, file_path, content_type=None):
                    return await put(file_path, file_content, {"contentType": content_type})
                
                async def download(self, file_path):
                    return await get(file_path)
                
                async def delete(self, file_path):
                    # Use the aliased delete function
                    return await delete_blob_op(file_path)
                
                async def list_files(self, prefix=None):
                    # Use the aliased list function
                    return await list_blobs(prefix)
            
            blob_client = VercelBlobClient()
            logger.info("Vercel Blob client initialized")
            return blob_client
            
        except ImportError:
            logger.error("Failed to import Vercel Blob client. Please install with: pip install @vercel/blob")
            return None
            
    except Exception as e:
        logger.error(f"Failed to initialize blob storage client: {str(e)}")
        return None

def get_asset_path(asset_type: str, filename: str) -> str:
    """
    Generate the full path for an asset in blob storage.
    
    Args:
        asset_type: Type of asset (images, audio, videos, etc.)
        filename: Name of the file
        
    Returns:
        Full path for the asset
        
    Raises:
        ValueError: If asset type is invalid
    """
    if asset_type not in ASSET_PATHS:
        raise ValueError(f"Invalid asset type: {asset_type}")
    
    base_path = ASSET_PATHS[asset_type]
    return f"{base_path}/{filename}"

def validate_asset(asset_type: str, filename: str, content_type: str = None, size_bytes: int = None) -> bool:
    """
    Validate asset before upload.
    
    Args:
        asset_type: Type of asset (images, audio, videos, etc.)
        filename: Name of the file
        content_type: MIME type of the file
        size_bytes: Size of the file in bytes
        
    Returns:
        True if asset is valid
        
    Raises:
        ValueError: If asset is invalid
    """
    if asset_type not in ASSET_CONFIGS:
        raise ValueError(f"Invalid asset type: {asset_type}")
    
    config = ASSET_CONFIGS[asset_type]
    
    # Check file extension
    ext = Path(filename).suffix.lower()
    if ext not in config["allowed_extensions"]:
        raise ValueError(f"Invalid file extension for {asset_type}: {ext}")
    
    # Check content type if provided
    if content_type:
        if content_type not in config["content_types"]:
            raise ValueError(f"Invalid content type for {asset_type}: {content_type}")
    
    # Check file size if provided
    if size_bytes:
        max_size_bytes = config["max_size_mb"] * 1024 * 1024
        if size_bytes > max_size_bytes:
            raise ValueError(f"File size exceeds maximum allowed size for {asset_type}")
    
    return True

async def upload_file(
    file_content: Union[bytes, BinaryIO],
    asset_type: str,
    filename: str,
    content_type: str = None
) -> Dict[str, str]:
    """
    Upload a file to blob storage.
    
    Args:
        file_content: Content of the file (bytes or file-like object)
        asset_type: Type of asset (images, audio, videos, etc.)
        filename: Name of the file
        content_type: MIME type of the file (detected from filename if not provided)
        
    Returns:
        Dict with URL and path of the uploaded file
        
    Raises:
        ValueError: If asset is invalid or blob storage is disabled
    """
    if not ENABLE_BLOB_STORAGE:
        raise ValueError("Blob storage is not configured. Set BLOB_READ_WRITE_TOKEN in environment.")
    
    # Initialize client if needed
    if blob_client is None:
        _initialize_client()
        
    if blob_client is None:
        raise ValueError("Failed to initialize blob storage client")
    
    # Auto-detect content type if not provided
    if content_type is None:
        content_type, _ = mimetypes.guess_type(filename)
        if content_type is None:
            content_type = "application/octet-stream"
    
    # Get file size for validation
    if hasattr(file_content, "seek") and hasattr(file_content, "tell"):
        current_pos = file_content.tell()
        file_content.seek(0, os.SEEK_END)
        size_bytes = file_content.tell()
        file_content.seek(current_pos)
    else:
        size_bytes = len(file_content)
    
    # Validate the file
    validate_asset(asset_type, filename, content_type, size_bytes)
    
    # Get the full path
    file_path = get_asset_path(asset_type, filename)
    
    try:
        # Upload the file
        result = await blob_client.upload(file_content, file_path, content_type)
        
        return {
            "url": result.url,
            "path": file_path
        }
    except Exception as e:
        logger.error(f"Failed to upload file {filename}: {str(e)}")
        raise ValueError(f"Failed to upload file: {str(e)}")

async def download_file(file_path: str) -> bytes:
    """
    Download a file from blob storage.
    
    Args:
        file_path: Path of the file
        
    Returns:
        File content as bytes
        
    Raises:
        ValueError: If blob storage is disabled or file not found
    """
    if not ENABLE_BLOB_STORAGE:
        raise ValueError("Blob storage is not configured. Set BLOB_READ_WRITE_TOKEN in environment.")
    
    # Initialize client if needed
    if blob_client is None:
        _initialize_client()
        
    if blob_client is None:
        raise ValueError("Failed to initialize blob storage client")
    
    try:
        # Download the file
        return await blob_client.download(file_path)
    except Exception as e:
        logger.error(f"Failed to download file {file_path}: {str(e)}")
        raise ValueError(f"Failed to download file: {str(e)}")

async def delete_file(file_path: str) -> bool:
    """
    Delete a file from blob storage.
    
    Args:
        file_path: Path of the file
        
    Returns:
        True if file was deleted
        
    Raises:
        ValueError: If blob storage is disabled or file not found
    """
    if not ENABLE_BLOB_STORAGE:
        raise ValueError("Blob storage is not configured. Set BLOB_READ_WRITE_TOKEN in environment.")
    
    # Initialize client if needed
    if blob_client is None:
        _initialize_client()
        
    if blob_client is None:
        raise ValueError("Failed to initialize blob storage client")
    
    try:
        # Delete the file
        await blob_client.delete(file_path)
        return True
    except Exception as e:
        logger.error(f"Failed to delete file {file_path}: {str(e)}")
        raise ValueError(f"Failed to delete file: {str(e)}")

async def list_files(asset_type: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    List files in blob storage.
    
    Args:
        asset_type: Type of asset (images, audio, videos, etc.) or None for all
        
    Returns:
        List of files with metadata
        
    Raises:
        ValueError: If blob storage is disabled
    """
    if not ENABLE_BLOB_STORAGE:
        raise ValueError("Blob storage is not configured. Set BLOB_READ_WRITE_TOKEN in environment.")
    
    # Initialize client if needed
    if blob_client is None:
        _initialize_client()
        
    if blob_client is None:
        raise ValueError("Failed to initialize blob storage client")
    
    try:
        prefix = None
        if asset_type:
            if asset_type not in ASSET_PATHS:
                raise ValueError(f"Invalid asset type: {asset_type}")
            prefix = ASSET_PATHS[asset_type]
        
        # List the files
        return await blob_client.list_files(prefix)
    except Exception as e:
        logger.error(f"Failed to list files: {str(e)}")
        raise ValueError(f"Failed to list files: {str(e)}") 