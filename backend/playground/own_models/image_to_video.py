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
    
    # If we have a local image but no URL, upload it first
    if image_path and not image_url:
        print(f"Uploading image: {image_path}")
        try:
            with open(image_path, "rb") as f:
                image_data = f.read()
            
            # Upload using fal client
            upload_response = await fal_client.upload_file_async(image_path)
            image_url = upload_response
            print(f"Image uploaded: {image_url}")
        except Exception as e:
            print(f"Error uploading image: {str(e)}")
            return None
    
    print(f"Generating video from image with prompt: {prompt}")
    
    try:
        # Prepare arguments for the API
        arguments = {
            "prompt": prompt,
            "image_url": image_url,
            "duration": duration,
            "aspect_ratio": aspect_ratio,
            "negative_prompt": negative_prompt,
            "cfg_scale": cfg_scale
        }
        
        print("Submitting request to Kling API...")
        
        # Method 1: Using subscribe (blocking but simpler)
        try:
            # Try using the subscribe method first, which returns the result directly
            result = fal_client.subscribe(
                "fal-ai/kling-video/v1.6/pro/image-to-video",
                arguments=arguments,
                with_logs=True,
                on_queue_update=on_queue_update
            )
            print("Video generation completed!")
        except Exception as e:
            print(f"Subscribe method failed, falling back to submit/result: {str(e)}")
            
            # Method 2: Submit and then get result (non-blocking initially)
            handler = fal_client.submit(
                "fal-ai/kling-video/v1.6/pro/image-to-video",
                arguments=arguments
            )
            
            request_id = handler.request_id
            print(f"Request ID: {request_id}")
            
            # Wait for the result
            print("Waiting for result...")
            # Use the correct method to get the result
            result = fal_client.result("fal-ai/kling-video/v1.6/pro/image-to-video", request_id)
            print("Video generation completed!")
        
        # Save the video if we have output_dir
        if output_dir and "video" in result and "url" in result["video"]:
            video_url = result["video"]["url"]
            output_path = Path(output_dir)
            output_path.mkdir(exist_ok=True, parents=True)
            
            # Generate a filename based on timestamp
            timestamp = int(time.time())
            video_filename = f"video_{timestamp}.mp4"
            video_path = output_path / video_filename
            
            # Download the video
            print(f"Downloading video from {video_url}...")
            response = requests.get(video_url)
            if response.status_code == 200:
                with open(video_path, "wb") as f:
                    f.write(response.content)
                print(f"Saved video to: {video_path}")
            else:
                print(f"Failed to download video: HTTP {response.status_code}")
        
        return result
