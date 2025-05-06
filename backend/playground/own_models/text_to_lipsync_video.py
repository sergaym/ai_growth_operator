#!/usr/bin/env python
"""
Text to Lipsync Video Pipeline

This script combines multiple AI models to create a talking video from:
1. Text (converted to speech)
2. Image (converted to video)
3. The generated speech is synced with the video using lipsync

It's a complete pipeline for creating lip-synced talking avatars.
"""

import argparse
import asyncio
import os
import tempfile
import time
from pathlib import Path

import requests
from dotenv import load_dotenv

# Import our custom modules
from image_to_video import submit as generate_video
from lipsync import submit as apply_lipsync
from text_image import submit as generate_image

# Load environment variables
load_dotenv()

# Check for API key
FAL_KEY = os.getenv("FAL_KEY") or os.getenv("FAL_API_KEY") or os.getenv("FAL_CLIENT_API_KEY")
if not FAL_KEY:
    print("Error: No FAL API key found. Please set FAL_KEY environment variable.")
    print("Get your API key from: https://app.fal.ai/settings/api-keys")
    exit(1)

# Set the environment variable
os.environ["FAL_KEY"] = FAL_KEY

