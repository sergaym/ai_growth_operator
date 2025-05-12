"""
Text-to-Image service integration for the AI Growth Operator.
This module provides interactions with the fal.ai API for image generation.
"""

import os
import time
import uuid
import asyncio
import base64
from pathlib import Path
from typing import Dict, List, Any, Optional, Union

import fal_client
from dotenv import load_dotenv

# Import settings
from app.core.config import settings
