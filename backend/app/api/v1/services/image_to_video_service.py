"""
Image-to-Video service integration for the AI Growth Operator.
This module provides interactions with the fal.ai Kling API for video generation from images.
"""

import os
import time
import uuid
import asyncio
import requests
import base64
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
FAL_KLING_MODEL = "fal-ai/kling-video/v1.6/pro/image-to-video"

# Default video settings
DEFAULT_DURATION = "5"  # 5 seconds
DEFAULT_ASPECT_RATIO = "16:9"
DEFAULT_PROMPT = "Realistic, cinematic movement, high quality"
DEFAULT_NEGATIVE_PROMPT = "blur, distort, and low quality"
DEFAULT_CFG_SCALE = 0.5

class ImageToVideoService:
    """Service for generating videos from images using fal.ai Kling API"""
    
    def __init__(self):
        """Initialize the ImageToVideoService with API credentials"""
        self.api_key = FAL_KEY
        if not self.api_key:
            raise ValueError("fal.ai API key not found. Please set FAL_KEY in your environment.")
        
        # Set the environment variable fal-client expects
        os.environ["FAL_KEY"] = self.api_key
        
        # Create video directory if it doesn't exist
        self.video_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))), "output", "videos")
        os.makedirs(self.video_dir, exist_ok=True)
    
    def on_queue_update(self, update):
        """Process queue updates and logs."""
        if isinstance(update, fal_client.InProgress):
            for log in update.logs:
                print(log["message"])
    
    async def upload_image(self, image_path: str) -> str:
        """
        Upload an image to the fal.ai service.
        
        Args:
            image_path: Path to the local image file
            
        Returns:
            URL of the uploaded image
        """
        try:
            # Upload using fal client
            upload_response = await fal_client.upload_file_async(image_path)
            return upload_response
        except Exception as e:
            print(f"Error uploading image: {str(e)}")
            raise ValueError(f"Failed to upload image: {str(e)}")
    
    async def upload_base64_image(self, base64_data: str, filename: str = None) -> str:
        """
        Upload a base64-encoded image to the fal.ai service.
        
        Args:
            base64_data: Base64-encoded image data
            filename: Optional filename to use
            
        Returns:
            URL of the uploaded image
        """
        try:
            # Generate a temporary file name if not provided
            if not filename:
                timestamp = int(time.time())
                filename = f"temp_image_{timestamp}.png"
            
            # Ensure the base64 data doesn't include the prefix
            if "," in base64_data and ";base64," in base64_data:
                base64_data = base64_data.split(";base64,")[1]
            
            # Create a temporary file
            temp_path = os.path.join(self.video_dir, filename)
            with open(temp_path, "wb") as f:
                f.write(base64.b64decode(base64_data))
            
            # Upload the temporary file
            url = await self.upload_image(temp_path)
            
            # Clean up the temporary file
            os.remove(temp_path)
            
            return url
        except Exception as e:
            print(f"Error uploading base64 image: {str(e)}")
            raise ValueError(f"Failed to upload base64 image: {str(e)}")
    
    async def generate_video(
        self,
        image_path: Optional[str] = None,
        image_url: Optional[str] = None,
        image_base64: Optional[str] = None,
        prompt: str = DEFAULT_PROMPT,
        duration: str = DEFAULT_DURATION,
        aspect_ratio: str = DEFAULT_ASPECT_RATIO,
        negative_prompt: str = DEFAULT_NEGATIVE_PROMPT,
        cfg_scale: float = DEFAULT_CFG_SCALE,
        save_video: bool = True
    ) -> Dict[str, Any]:
        """
        Generate a video from an image.
        
        Args:
            image_path: Path to local image file
            image_url: URL to hosted image
            image_base64: Base64-encoded image data
            prompt: Text description to guide video generation
            duration: Video duration in seconds ("5" or "10")
            aspect_ratio: Aspect ratio of the output video ("16:9", "9:16", "1:1")
            negative_prompt: What to avoid in the video
            cfg_scale: How closely to follow the prompt (0.0-1.0)
            save_video: Whether to save the video to disk
            
        Returns:
            Dictionary containing the video generation results
        """
        # Validate input - need at least one image source
        if not image_path and not image_url and not image_base64:
            raise ValueError("Either image_path, image_url, or image_base64 must be provided")
        
        # Use the image URL if provided, otherwise upload the image
        if not image_url:
            if image_path:
                print(f"Uploading image from path: {image_path}")
                image_url = await self.upload_image(image_path)
            elif image_base64:
                print("Uploading base64 image data")
                image_url = await self.upload_base64_image(image_base64)
        
        print(f"Generating video from image with prompt: {prompt}")
        
        # Generate a unique ID for this request
        request_id = str(uuid.uuid4())
        timestamp = int(time.time())
        
        try:
            # Prepare arguments for the API
            arguments = {
                "prompt": prompt,
                "image_url": image_url,
                "duration": duration,
                "aspect_ratio": aspect_ratio,
                "negative_prompt": negative_prompt,
                "cfg_scale": cfg_scale
            }
            
            print("Submitting request to Kling API...")
            
            try:
                # Submit the request with progress updates
                result = fal_client.subscribe(
                    FAL_KLING_MODEL,
                    arguments=arguments,
                    with_logs=True,
                    on_queue_update=self.on_queue_update
                )
                print("Video generation completed!")
            except Exception as e:
                print(f"Subscribe method failed, falling back to submit/result: {str(e)}")
                
                # Method 2: Submit and then get result (non-blocking initially)
                handler = fal_client.submit(
                    FAL_KLING_MODEL,
                    arguments=arguments
                )
                
                req_id = handler.request_id
                print(f"Request ID: {req_id}")
                
                # Wait for the result
                print("Waiting for result...")
                result = fal_client.result(FAL_KLING_MODEL, req_id)
                print("Video generation completed!")
            
            # Extract video URL and prepare response
            response = {
                "request_id": request_id,
                "prompt": prompt,
                "status": "completed",
                "timestamp": timestamp,
                "parameters": {
                    "duration": duration,
                    "aspect_ratio": aspect_ratio,
                    "cfg_scale": cfg_scale
                }
            }
            
            # Save the video if requested and URL is available
            video_path = None
            if "video" in result and "url" in result["video"]:
                video_url = result["video"]["url"]
                response["video_url"] = video_url
                
                # Save to disk if requested
                if save_video:
                    video_filename = f"video_{timestamp}_{request_id[:8]}.mp4"
                    video_path = os.path.join(self.video_dir, video_filename)
                    
                    # Download the video
                    print(f"Downloading video from {video_url}...")
                    download_response = requests.get(video_url)
                    if download_response.status_code == 200:
                        with open(video_path, "wb") as f:
                            f.write(download_response.content)
                        print(f"Saved video to: {video_path}")
                        
                        # Add file path to response
                        response["video_path"] = str(video_path)
                        response["local_video_url"] = f"file://{video_path}"
                    else:
                        print(f"Failed to download video: HTTP {download_response.status_code}")
            
            # Include the preview image if available
            if "preview_image" in result and "url" in result["preview_image"]:
                response["preview_image_url"] = result["preview_image"]["url"]
            
            return response
            
        except Exception as e:
            error_message = str(e)
            print(f"Error generating video: {error_message}")
            
            return {
                "request_id": request_id,
                "prompt": prompt,
                "status": "error",
                "error": error_message,
                "timestamp": timestamp
            }


# Create a singleton instance of the service
image_to_video_service = ImageToVideoService() 