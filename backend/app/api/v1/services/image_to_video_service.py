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

