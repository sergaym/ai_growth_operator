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

