"""
Lipsync service integration for the AI Growth Operator.
This module provides integration with fal.ai latentsync model for lip synchronization.
"""

import os
import time
import uuid
import asyncio
import requests
from pathlib import Path
from typing import Dict, Any, Optional, Union
import logging

# Import fal client for API access
import fal_client
from dotenv import load_dotenv

# Import settings
from app.core.config import settings

# Import database components if needed for storage
from app.db.blob_storage import upload_file, AssetType

# Import database components
from app.db import get_db, lipsync_repository

# Configure logging
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Constants
FAL_KEY = os.getenv("FAL_KEY") or os.getenv("FAL_API_KEY") or settings.FAL_CLIENT_API_KEY
FAL_LATENTSYNC_MODEL = "fal-ai/latentsync"


class LipsyncService:
    """Service for synchronizing lip movements in videos with audio using fal.ai latentsync model"""
    
    def __init__(self):
        """Initialize the LipsyncService with API credentials"""
        self.api_key = FAL_KEY
        if not self.api_key:
            raise ValueError("fal.ai API key not found. Please set FAL_KEY in your environment.")
        
        # Set the environment variable fal-client expects
        os.environ["FAL_KEY"] = self.api_key
        
        # Create output directories if they don't exist
        self.root_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
        self.output_dir = os.path.join(self.root_dir, "output", "lipsync")
        
        os.makedirs(self.output_dir, exist_ok=True)
    
    def on_queue_update(self, update):
        """Process queue updates and logs."""
        if isinstance(update, fal_client.InProgress):
            for log in update.logs:
                logger.info(f"Lipsync progress: {log['message']}")
    
    async def upload_file(self, file_path: str) -> str:
        """
        Upload a file to the fal.ai service.
        
        Args:
            file_path: Path to the local file
            
        Returns:
            URL of the uploaded file
        """
        try:
            # Upload using fal client
            upload_response = await fal_client.upload_file_async(file_path)
            logger.info(f"File uploaded successfully: {upload_response}")
            # Ensure we return a string
            return str(upload_response)
        except Exception as e:
            logger.error(f"Error uploading file: {str(e)}")
            raise ValueError(f"Failed to upload file: {str(e)}")
    
    async def download_file(self, url: str, file_path: str) -> str:
        """
        Download a file from a URL.
        
        Args:
            url: URL of the file to download
            file_path: Path where the file should be saved
            
        Returns:
            Path to the downloaded file
        """
        try:
            logger.info(f"Downloading from {url} to {file_path}")
            response = requests.get(url, stream=True)
            response.raise_for_status()
            
            with open(file_path, "wb") as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            
            logger.info(f"Downloaded file to {file_path}")
            return file_path
        except Exception as e:
            logger.error(f"Error downloading file: {str(e)}")
            raise ValueError(f"Failed to download file: {str(e)}")
    
    async def lipsync(
        self,
        video_url: Optional[str] = None,
        video_path: Optional[str] = None,
        audio_url: Optional[str] = None,
        audio_path: Optional[str] = None,
        save_result: bool = True,
        user_id: Optional[str] = None,
        workspace_id: Optional[str] = None,
        project_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generate a lip-synced video from the provided video and audio sources.
        
        Args:
            video_url: URL to the source video
            video_path: Path to local video file
            audio_url: URL to the audio file
            audio_path: Path to local audio file
            save_result: Whether to save the result to disk
            user_id: ID of the user
            workspace_id: ID of the workspace
            project_id: ID of the project
            
        Returns:
            Dictionary containing the lipsync results
        """
        # Generate a unique ID for this request and timestamp
        request_id = str(uuid.uuid4())
        timestamp = int(time.time())
        
        # Prepare local paths and URLs
        temp_video_path = None
        temp_audio_path = None
        uploaded_video_url = None
        uploaded_audio_url = None
        
        try:
            # Log request
            logger.info(f"Processing lipsync request: video_url={video_url}, video_path={video_path}, audio_url={audio_url}, audio_path={audio_path}")
            
            # Handle video source
            if video_path and os.path.exists(video_path):
                # Upload local video file
                logger.info(f"Uploading video from path: {video_path}")
                uploaded_video_url = await self.upload_file(video_path)
            elif video_url:
                # Use provided video URL - ensure it's a string
                uploaded_video_url = str(video_url)
            else:
                raise ValueError("No valid video source provided")
            
            # Handle audio source
            if audio_path and os.path.exists(audio_path):
                # Upload local audio file
                logger.info(f"Uploading audio from path: {audio_path}")
                uploaded_audio_url = await self.upload_file(audio_path)
            elif audio_url:
                # Use provided audio URL - ensure it's a string
                uploaded_audio_url = str(audio_url)
            else:
                raise ValueError("No valid audio source provided")
            
            # Ensure both URLs are strings
            if not isinstance(uploaded_video_url, str):
                uploaded_video_url = str(uploaded_video_url)
            if not isinstance(uploaded_audio_url, str):
                uploaded_audio_url = str(uploaded_audio_url)
                
            logger.info(f"Using video URL: {uploaded_video_url}")
            logger.info(f"Using audio URL: {uploaded_audio_url}")
                
            # Prepare arguments for the latentsync API - ensure all values are JSON serializable
            arguments = {
                "video_url": uploaded_video_url,
                "audio_url": uploaded_audio_url,
                "sync_lip_movements": True
            }
            
            logger.info(f"Submitting lipsync request with arguments: {arguments}")
            
            # Submit the request with progress updates
            try:
                result = fal_client.subscribe(
                    FAL_LATENTSYNC_MODEL,
                    arguments=arguments,
                    with_logs=True,
                    on_queue_update=self.on_queue_update
                )
                logger.info("Lipsync generation completed!")
            except Exception as e:
                logger.error(f"Subscribe method failed, falling back to submit/result: {str(e)}")
                
                # Alternative: Submit and then get result
                handler = fal_client.submit(
                    FAL_LATENTSYNC_MODEL,
                    arguments=arguments
                )
                
                req_id = handler.request_id
                logger.info(f"Request ID: {req_id}")
                
                # Wait for the result
                logger.info("Waiting for lipsync result...")
                result = fal_client.result(FAL_LATENTSYNC_MODEL, req_id)
                logger.info("Lipsync generation completed!")
            
            # Extract video URL from the result
            response = {
                "status": "completed",
                "created_at": timestamp
            }
            
            # Get result URL - check for the nested video object structure
            if "video" in result and "url" in result["video"]:
                result_url = result["video"]["url"]
                response["video_url"] = result_url
                
                # Download and save the result if requested
                if save_result:
                    output_filename = f"lipsync_{timestamp}_{request_id[:8]}.mp4"
                    output_path = os.path.join(self.output_dir, output_filename)
                    
                    await self.download_file(result_url, output_path)
                    response["local_path"] = output_path
                    
                    # Upload to blob storage if configured
                    if settings.BLOB_READ_WRITE_TOKEN:
                        try:
                            with open(output_path, "rb") as video_file:
                                blob_result = await upload_file(
                                    file_content=video_file.read(),
                                    asset_type=AssetType.VIDEOS,
                                    filename=output_filename,
                                    content_type="video/mp4"
                                )
                            blob_url = blob_result.get("url")
                            response["blob_url"] = blob_url
                            logger.info(f"Uploaded lipsync video to blob storage: {blob_url}")
                        except Exception as e:
                            logger.error(f"Error uploading to blob storage: {str(e)}")
            # Also check for direct URL at top level (for backward compatibility)
            elif "url" in result:
                result_url = result["url"]
                response["video_url"] = result_url
                
                # Same download and storage logic as above
                if save_result:
                    output_filename = f"lipsync_{timestamp}_{request_id[:8]}.mp4"
                    output_path = os.path.join(self.output_dir, output_filename)
                    
                    await self.download_file(result_url, output_path)
                    response["local_path"] = output_path
                    
                    # Upload to blob storage if configured
                    if settings.BLOB_READ_WRITE_TOKEN:
                        try:
                            with open(output_path, "rb") as video_file:
                                blob_result = await upload_file(
                                    file_content=video_file.read(),
                                    asset_type=AssetType.VIDEOS,
                                    filename=output_filename,
                                    content_type="video/mp4"
                                )
                            blob_url = blob_result.get("url")
                            response["blob_url"] = blob_url
                            logger.info(f"Uploaded lipsync video to blob storage: {blob_url}")
                        except Exception as e:
                            logger.error(f"Error uploading to blob storage: {str(e)}")
                
                # Save to database for backward compatibility case too
                try:
                    # Prepare database data for lipsync video
                    db_data = {
                        "status": "completed",
                        "metadata_json": {
                            "video_url": uploaded_video_url,
                            "audio_url": uploaded_audio_url,
                            "result": result,
                            "timestamp": timestamp,
                            "request_id": request_id
                        }
                    }
                    
                    # Add file paths/URLs if available
                    if response.get("local_path"):
                        db_data["file_path"] = response["local_path"]
                        db_data["local_url"] = f"file://{response['local_path']}"
                    if response.get("video_url"):
                        db_data["file_url"] = response["video_url"]
                    if response.get("blob_url"):
                        db_data["blob_url"] = response["blob_url"]
                    
                    # Add user, workspace, and project IDs if provided
                    if user_id:
                        db_data["user_id"] = user_id
                    if workspace_id:
                        db_data["workspace_id"] = workspace_id
                    if project_id:
                        db_data["project_id"] = project_id
                    
                    # Save to database
                    db = next(get_db())
                    db_lipsync = lipsync_repository.create(db_data, db)
                    
                    if db_lipsync:
                        response["db_id"] = db_lipsync.id
                        logger.info(f"Saved lipsync video to database with ID: {db_lipsync.id}")
                        
                except Exception as e:
                    logger.error(f"Error saving lipsync video to database: {str(e)}")
                    # Continue execution even if database save fails
            else:
                # Log the full response structure for debugging
                logger.error(f"No result URL found in response structure: {result}")
                raise ValueError("No video URL found in service response. Response structure: " + str(result))
            
            # Get duration if available
            if "duration" in result:
                response["duration"] = result["duration"]
            
            # Save to database
            try:
                # Prepare database data for lipsync video
                db_data = {
                    "status": "completed",
                    "metadata_json": {
                        "video_url": uploaded_video_url,
                        "audio_url": uploaded_audio_url,
                        "result": result,
                        "timestamp": timestamp,
                        "request_id": request_id
                    }
                }
                
                # Add file paths/URLs if available
                if response.get("local_path"):
                    db_data["file_path"] = response["local_path"]
                    db_data["local_url"] = f"file://{response['local_path']}"
                if response.get("video_url"):
                    db_data["file_url"] = response["video_url"]
                if response.get("blob_url"):
                    db_data["blob_url"] = response["blob_url"]
                
                # Add user, workspace, and project IDs if provided
                if user_id:
                    db_data["user_id"] = user_id
                if workspace_id:
                    db_data["workspace_id"] = workspace_id
                if project_id:
                    db_data["project_id"] = project_id
                
                # Save to database
                db = next(get_db())
                db_lipsync = lipsync_repository.create(db_data, db)
                
                if db_lipsync:
                    response["db_id"] = db_lipsync.id
                    logger.info(f"Saved lipsync video to database with ID: {db_lipsync.id}")
                    
            except Exception as e:
                logger.error(f"Error saving lipsync video to database: {str(e)}")
                # Continue execution even if database save fails
            
            # Clean up temporary files
            if temp_video_path and os.path.exists(temp_video_path):
                os.remove(temp_video_path)
            if temp_audio_path and os.path.exists(temp_audio_path):
                os.remove(temp_audio_path)
            
            return response
            
        except Exception as e:
            error_message = str(e)
            logger.error(f"Error in lipsync generation: {error_message}")
            
            # Clean up temporary files
            if temp_video_path and os.path.exists(temp_video_path):
                os.remove(temp_video_path)
            if temp_audio_path and os.path.exists(temp_audio_path):
                os.remove(temp_audio_path)
            
            return {
                "status": "error",
                "error": error_message,
                "created_at": timestamp
            }


# Create a singleton instance of the service
lipsync_service = LipsyncService() 