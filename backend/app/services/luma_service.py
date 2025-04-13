"""
Luma AI service integration for the AI Growth Operator.
This module provides all interactions with the Luma AI API for video generation.
"""

import os
import time
import uuid
import requests
from typing import Dict, List, Any, Optional
from dotenv import load_dotenv
from lumaai import LumaAI

# Import settings
from app.core.config import settings

# Load environment variables
load_dotenv()

# Luma AI API constants
LUMA_API_KEY = os.getenv("LUMAAI_API_KEY")
LUMA_POLLING_INTERVAL = 10  # seconds

