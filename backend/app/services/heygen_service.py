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
    
