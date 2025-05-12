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
