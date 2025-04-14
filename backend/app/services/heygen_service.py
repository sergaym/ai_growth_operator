"""
Heygen API service for creating avatar videos
"""

import os
import requests
import time
import logging
from typing import Dict, Any, List, Optional

# Configure logging
logger = logging.getLogger(__name__)

class HeygenService:
    """Service for interacting with the Heygen API to create avatar videos."""
    
    def __init__(self):
        """Initialize the Heygen API service with API key from environment."""
        self.api_key = os.environ.get("HEYGEN_API_KEY")
        if not self.api_key:
            raise ValueError("HEYGEN_API_KEY environment variable is required")
        
        self.base_url = "https://api.heygen.com"
        self.headers = {
            "X-Api-Key": self.api_key,
            "Content-Type": "application/json"
        }
    
    def list_avatars(self) -> List[Dict[str, Any]]:
        """Get a list of available avatars from Heygen API."""
        url = f"{self.base_url}/v2/avatars"
        
        try:
            response = requests.get(url, headers=self.headers)
            response.raise_for_status()
            data = response.json()
            return data.get("data", {}).get("avatars", [])
        except requests.RequestException as e:
            logger.error(f"Error listing avatars: {str(e)}")
            raise Exception(f"Failed to list avatars: {str(e)}")
    
    def list_voices(self) -> List[Dict[str, Any]]:
        """Get a list of available voices from Heygen API."""
        url = f"{self.base_url}/v2/voices"
        
        try:
            response = requests.get(url, headers=self.headers)
            response.raise_for_status()
            data = response.json()
            return data.get("data", {}).get("voices", [])
        except requests.RequestException as e:
            logger.error(f"Error listing voices: {str(e)}")
            raise Exception(f"Failed to list voices: {str(e)}")
    
    def generate_avatar_video(
        self,
        prompt: str,
        avatar_id: str,
        voice_id: str,
        background_color: str = "#f6f6fc",
        width: int = 1280,
        height: int = 720,
        voice_speed: float = 1.0,
        voice_pitch: int = 0,
        avatar_style: str = "normal",
        callback_url: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generate an avatar video using the Heygen API.
        
        Args:
            prompt: The text for the avatar to speak
            avatar_id: The ID of the avatar to use
            voice_id: The ID of the voice to use
            background_color: Background color in hex format (default: "#f6f6fc")
            width: Video width in pixels (default: 1280)
            height: Video height in pixels (default: 720)
            voice_speed: Voice speed, between 0.5 and 1.5 (default: 1.0)
            voice_pitch: Voice pitch, between -50 and 50 (default: 0)
            avatar_style: Avatar style, one of "normal", "circle", "closeUp" (default: "normal")
            callback_url: Optional URL for callbacks when video is complete
        
        Returns:
            Dict containing the video ID and status
        """
        url = f"{self.base_url}/v2/video/generate"
        
        payload = {
            "video_inputs": [
                {
                    "character": {
                        "type": "avatar",
                        "avatar_id": avatar_id,
                        "avatar_style": avatar_style
                    },
                    "voice": {
                        "type": "text",
                        "input_text": prompt,
                        "voice_id": voice_id,
                        "speed": voice_speed,
                        "pitch": voice_pitch
                    },
                    "background": {
                        "type": "color",
                        "value": background_color
                    }
                }
            ],
            "dimension": {
                "width": width,
                "height": height
            }
        }
        
        if callback_url:
            payload["callback_url"] = callback_url
        
        try:
            response = requests.post(url, headers=self.headers, json=payload)
            response.raise_for_status()
            data = response.json()
            
            if data.get("error"):
                logger.error(f"Heygen API error: {data.get('error')}")
                raise Exception(f"Heygen API error: {data.get('error')}")
                
            return {
                "video_id": data.get("data", {}).get("video_id"),
                "status": "pending"
            }
        except requests.RequestException as e:
            logger.error(f"Error generating avatar video: {str(e)}")
            raise Exception(f"Failed to generate avatar video: {str(e)}")
    
