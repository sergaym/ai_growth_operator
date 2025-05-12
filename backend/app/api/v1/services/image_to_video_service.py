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
    
