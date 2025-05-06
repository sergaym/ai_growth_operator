import argparse
import asyncio
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
    video_path=None,
    video_url=None,
    audio_path=None,
    audio_url=None,
    output_dir=None
):
    """
    Submit a lipsync request to synchronize audio with video.
    
    Args:
        video_path: Path to local video file
        video_url: URL to hosted video (alternative to video_path)
        audio_path: Path to local audio file
        audio_url: URL to hosted audio (alternative to audio_path)
        output_dir: Directory to save the output synchronized video
        
    Returns:
        Result object from the API with the synchronized video URL
    """
    if not ((video_path or video_url) and (audio_path or audio_url)):
        print("Error: Both video and audio sources must be provided")
        return None
    
    # If we have local files but no URLs, upload them first
    if video_path and not video_url:
        print(f"Uploading video: {video_path}")
        try:
            # Upload video using fal client
            video_url = await fal_client.upload_file_async(video_path)
            print(f"Video uploaded: {video_url}")
        except Exception as e:
            print(f"Error uploading video: {str(e)}")
            return None
    
    if audio_path and not audio_url:
        print(f"Uploading audio: {audio_path}")
        try:
            # Upload audio using fal client
            audio_url = await fal_client.upload_file_async(audio_path)
            print(f"Audio uploaded: {audio_url}")
        except Exception as e:
            print(f"Error uploading audio: {str(e)}")
            return None
    
    print("Starting lipsync process...")
    
