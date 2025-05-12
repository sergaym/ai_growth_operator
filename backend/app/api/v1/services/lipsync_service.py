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
        save_result: bool = True
    ) -> Dict[str, Any]:
        """
        Synchronize audio with video.
        
        Args:
            video_path: Path to local video file
            video_url: URL to hosted video
            audio_path: Path to local audio file
            audio_url: URL to hosted audio
            save_result: Whether to save the result to disk
            
        Returns:
            Dictionary containing the lipsync results
        """
        # Validate input - need both video and audio
        if not ((video_path or video_url) and (audio_path or audio_url)):
            raise ValueError("Both video source (path or URL) and audio source (path or URL) must be provided")
        
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
        
        # Generate a unique ID for this request
        request_id = str(uuid.uuid4())
        timestamp = int(time.time())
        
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
            
            # Save the video if requested and URL is available
            if "video" in result and "url" in result["video"]:
                video_url = result["video"]["url"]
                response["output_video_url"] = video_url
                
                # Save to disk if requested
                if save_result:
                    video_filename = f"lipsync_{timestamp}_{request_id[:8]}.mp4"
                    video_path = os.path.join(self.output_dir, video_filename)
                    
                    # Download the video
                    print(f"Downloading synchronized video from {video_url}...")
                    download_response = requests.get(video_url)
                    if download_response.status_code == 200:
                        with open(video_path, "wb") as f:
                            f.write(download_response.content)
                        print(f"Saved synchronized video to: {video_path}")
                        
                        # Add file path to response
                        response["output_video_path"] = str(video_path)
                        response["local_video_url"] = f"file://{video_path}"
                    else:
                        print(f"Failed to download video: HTTP {download_response.status_code}")
            
            return response
            
        except Exception as e:
            error_message = str(e)
            print(f"Error in lipsync process: {error_message}")
            
            return {
                "request_id": request_id,
                "status": "error",
                "error": error_message,
                "timestamp": timestamp,
                "input": {
                    "video_url": video_url,
                    "audio_url": audio_url
                }
            }


# Create a singleton instance of the service
lipsync_service = LipsyncService() 