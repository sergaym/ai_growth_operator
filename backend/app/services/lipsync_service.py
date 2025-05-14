"""
Lipsync service integration for the AI Growth Operator.
This module provides interactions with the fal.ai latentsync API for synchronizing audio with video.
"""

import os
import time
import uuid
import asyncio
import requests
from pathlib import Path
from typing import Dict, List, Any, Optional, Union

import fal_client
from dotenv import load_dotenv

# Import settings
from app.core.config import settings

# Import database components
from app.db import get_db, lipsync_repository, video_repository, audio_repository
from app.db.blob_storage import upload_file, AssetType

# Load environment variables
load_dotenv()

# Constants
FAL_KEY = os.getenv("FAL_KEY") or os.getenv("FAL_API_KEY") or os.getenv("FAL_CLIENT_API_KEY") or settings.FAL_CLIENT_API_KEY
FAL_LIPSYNC_MODEL = "fal-ai/latentsync"

class LipsyncService:
    """Service for synchronizing audio with video using fal.ai latentsync API"""
    
    def __init__(self):
        """Initialize the LipsyncService with API credentials"""
        self.api_key = FAL_KEY
        if not self.api_key:
            raise ValueError("fal.ai API key not found. Please set FAL_KEY in your environment.")
        
        # Set the environment variable fal-client expects
        os.environ["FAL_KEY"] = self.api_key
        
        # Create output directory if it doesn't exist
        self.output_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))), "output", "lipsync")
        os.makedirs(self.output_dir, exist_ok=True)
    
    def on_queue_update(self, update):
        """Process queue updates and logs."""
        if isinstance(update, fal_client.InProgress):
            for log in update.logs:
                print(log["message"])
    
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
            return upload_response
        except Exception as e:
            print(f"Error uploading file: {str(e)}")
            raise ValueError(f"Failed to upload file: {str(e)}")
    
    async def lipsync(
        self,
        video_path: Optional[str] = None,
        video_url: Optional[str] = None,
        audio_path: Optional[str] = None,
        audio_url: Optional[str] = None,
        save_result: bool = True,
        upload_to_blob: bool = False,
        video_id: Optional[str] = None,
        audio_id: Optional[str] = None,
        user_id: Optional[str] = None,
        workspace_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Synchronize audio with video.
        
        Args:
            video_path: Path to local video file
            video_url: URL to hosted video
            audio_path: Path to local audio file
            audio_url: URL to hosted audio
            save_result: Whether to save the result to disk
            upload_to_blob: Whether to upload the result to blob storage
            video_id: Optional ID of a video record to link
            audio_id: Optional ID of an audio record to link
            user_id: Optional user ID to associate with the lipsync video
            workspace_id: Optional workspace ID to associate with the lipsync video
            
        Returns:
            Dictionary containing the lipsync results
        """
        # Validate input - need both video and audio
        if not ((video_path or video_url) and (audio_path or audio_url)):
            raise ValueError("Both video source (path or URL) and audio source (path or URL) must be provided")
        
        # Generate a unique ID for this request
        request_id = str(uuid.uuid4())
        timestamp = int(time.time())
        
        # Upload files if paths are provided but not URLs
        if video_path and not video_url:
            print(f"Uploading video from path: {video_path}")
            video_url = await self.upload_file(video_path)
            print(f"Video uploaded to: {video_url}")
        
        if audio_path and not audio_url:
            print(f"Uploading audio from path: {audio_path}")
            audio_url = await self.upload_file(audio_path)
            print(f"Audio uploaded to: {audio_url}")
        
        print("Starting lipsync process...")
        
        try:
            # Prepare arguments for the API
            arguments = {
                "video_url": video_url,
                "audio_url": audio_url
            }
            
            print("Submitting request to latentsync API...")
            
            try:
                # Submit the request with progress updates
                result = fal_client.subscribe(
                    FAL_LIPSYNC_MODEL,
                    arguments=arguments,
                    with_logs=True,
                    on_queue_update=self.on_queue_update
                )
                print("Lipsync completed!")
            except Exception as e:
                print(f"Subscribe method failed, falling back to submit/result: {str(e)}")
                
                # Method 2: Submit and then get result (non-blocking initially)
                handler = fal_client.submit(
                    FAL_LIPSYNC_MODEL,
                    arguments=arguments
                )
                
                req_id = handler.request_id
                print(f"Request ID: {req_id}")
                
                # Wait for the result
                print("Waiting for result...")
                result = fal_client.result(FAL_LIPSYNC_MODEL, req_id)
                print("Lipsync completed!")
            
            # Extract video URL and prepare response
            response = {
                "request_id": request_id,
                "status": "completed",
                "timestamp": timestamp,
                "input": {
                    "video_url": video_url,
                    "audio_url": audio_url
                }
            }
            
            # If IDs were provided, add them to response
            if video_id:
                response["video_id"] = video_id
            if audio_id:
                response["audio_id"] = audio_id
            
            # Save the video if requested and URL is available
            output_video_path = None
            blob_url = None
            
            if "video" in result and "url" in result["video"]:
                output_video_url = result["video"]["url"]
                response["output_video_url"] = output_video_url
                
                # Save to disk if requested
                if save_result:
                    video_filename = f"lipsync_{timestamp}_{request_id[:8]}.mp4"
                    output_video_path = os.path.join(self.output_dir, video_filename)
                    
                    # Download the video
                    print(f"Downloading synchronized video from {output_video_url}...")
                    download_response = requests.get(output_video_url)
                    if download_response.status_code == 200:
                        with open(output_video_path, "wb") as f:
                            f.write(download_response.content)
                        print(f"Saved synchronized video to: {output_video_path}")
                        
                        # Add file path to response
                        response["output_video_path"] = str(output_video_path)
                        response["local_video_url"] = f"file://{output_video_path}"
                        
                        # Upload to blob storage if requested
                        if upload_to_blob and settings.BLOB_READ_WRITE_TOKEN:
                            try:
                                with open(output_video_path, "rb") as video_file:
                                    blob_result = await upload_file(
                                        file_content=video_file.read(),
                                        asset_type=AssetType.VIDEOS,
                                        filename=video_filename,
                                        content_type="video/mp4"
                                    )
                                blob_url = blob_result.get("url")
                                response["blob_url"] = blob_url
                                print(f"Uploaded video to blob storage: {blob_url}")
                            except Exception as e:
                                print(f"Error uploading to blob storage: {str(e)}")
                    else:
                        print(f"Failed to download video: HTTP {download_response.status_code}")
            
            # Save to database
            try:
                # Prepare database data
                db_data = {
                    "status": "completed",
                    "metadata_json": {
                        "request_id": request_id,
                        "timestamp": timestamp,
                        "input": {
                            "video_url": video_url,
                            "audio_url": audio_url
                        },
                        "result": result
                    }
                }
                
                # Link to video and audio if IDs were provided
                if video_id:
                    db_data["video_id"] = video_id
                
                if audio_id:
                    db_data["audio_id"] = audio_id
                
                # Add file paths if available
                if output_video_path:
                    db_data["file_path"] = output_video_path
                    db_data["local_url"] = f"file://{output_video_path}"
                
                if output_video_url:
                    db_data["file_url"] = output_video_url
                
                if blob_url:
                    db_data["blob_url"] = blob_url
                
                # Add user and workspace IDs if provided
                if user_id:
                    db_data["user_id"] = user_id
                
                if workspace_id:
                    db_data["workspace_id"] = workspace_id
                
                # Get a database session and save the lipsync video
                db = next(get_db())
                db_lipsync = lipsync_repository.create(db_data, db)
                
                if db_lipsync:
                    response["db_id"] = db_lipsync.id
            except Exception as e:
                print(f"Error saving to database: {str(e)}")
            
            return response
            
        except Exception as e:
            error_message = str(e)
            print(f"Error in lipsync process: {error_message}")
            
            error_response = {
                "request_id": request_id,
                "status": "error",
                "error": error_message,
                "timestamp": timestamp,
                "input": {
                    "video_url": video_url,
                    "audio_url": audio_url
                }
            }
            
            # If IDs were provided, add them to response
            if video_id:
                error_response["video_id"] = video_id
            if audio_id:
                error_response["audio_id"] = audio_id
            
            # Save error to database
            try:
                # Prepare error data for database
                error_db_data = {
                    "status": "failed",
                    "metadata_json": {
                        "request_id": request_id,
                        "timestamp": timestamp,
                        "error": error_message,
                        "input": {
                            "video_url": video_url,
                            "audio_url": audio_url
                        }
                    }
                }
                
                # Link to video and audio if IDs were provided
                if video_id:
                    error_db_data["video_id"] = video_id
                
                if audio_id:
                    error_db_data["audio_id"] = audio_id
                
                # Add user and workspace IDs if provided
                if user_id:
                    error_db_data["user_id"] = user_id
                
                if workspace_id:
                    error_db_data["workspace_id"] = workspace_id
                
                # Get a database session and save the error
                db = next(get_db())
                db_lipsync = lipsync_repository.create(error_db_data, db)
                
                if db_lipsync:
                    error_response["db_id"] = db_lipsync.id
            except Exception as db_error:
                print(f"Error saving failed request to database: {str(db_error)}")
            
            return error_response


# Create a singleton instance of the service
lipsync_service = LipsyncService() 