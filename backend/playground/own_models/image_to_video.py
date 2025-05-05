import argparse
import asyncio
import base64
import os
import sys
import time
from pathlib import Path

import fal_client
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Check for API key
FAL_KEY = os.getenv("FAL_KEY") or os.getenv("FAL_API_KEY") or os.getenv("FAL_CLIENT_API_KEY")
if not FAL_KEY:
    print("Error: No FAL API key found. Please set FAL_KEY environment variable.")
    print("Get your API key from: https://app.fal.ai/settings/api-keys")
    sys.exit(1)

# Set the environment variable fal-client expects
os.environ["FAL_KEY"] = FAL_KEY

def on_queue_update(update):
    """Process queue updates and logs."""
    if isinstance(update, fal_client.InProgress):
        for log in update.logs:
            print(log["message"])

async def submit(
    image_path=None, 
    image_url=None,
    prompt="Realistic, cinematic movement, high quality",
    duration="5",
    aspect_ratio="16:9",
    negative_prompt="blur, distort, and low quality",
    cfg_scale=0.5,
    output_dir=None
):
    """
    Submit an image-to-video generation request.
    
    Args:
        image_path: Path to local image file
        image_url: URL to hosted image (alternative to image_path)
        prompt: Text description to guide video generation
        duration: Video duration in seconds ("5" or "10")
        aspect_ratio: Aspect ratio of the output video ("16:9", "9:16", "1:1")
        negative_prompt: What to avoid in the video
        cfg_scale: How closely to follow the prompt (0.0-1.0)
        output_dir: Directory to save the output video
        
    Returns:
        Result object from the API
    """
    if not image_path and not image_url:
        print("Error: Either image_path or image_url must be provided")
        return None
