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
    
