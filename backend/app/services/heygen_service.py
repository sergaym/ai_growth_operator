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
