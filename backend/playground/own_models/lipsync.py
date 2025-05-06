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
    
    try:
        # Prepare arguments for the API
        arguments = {
            "video_url": video_url,
            "audio_url": audio_url
        }
        
        print("Submitting request to latentsync API...")
        
        # Try using the subscribe method first (blocking but simpler)
        try:
            result = fal_client.subscribe(
                "fal-ai/latentsync",
                arguments=arguments,
                with_logs=True,
                on_queue_update=on_queue_update
            )
            print("Lipsync completed!")
        except Exception as e:
            print(f"Subscribe method failed, falling back to submit/result: {str(e)}")
            
            # Fall back to submit and then get result
            handler = fal_client.submit(
                "fal-ai/latentsync",
                arguments=arguments
            )
            
            request_id = handler.request_id
            print(f"Request ID: {request_id}")
            
            # Wait for the result
            print("Waiting for result...")
            result = fal_client.result("fal-ai/latentsync", request_id)
            print("Lipsync completed!")
        
        # Save the video if we have output_dir
        if output_dir and "video" in result and "url" in result["video"]:
            video_url = result["video"]["url"]
            output_path = Path(output_dir)
            output_path.mkdir(exist_ok=True, parents=True)
            
            # Generate a filename based on timestamp
            timestamp = int(time.time())
            video_filename = f"lipsync_{timestamp}.mp4"
            video_path = output_path / video_filename
            
            # Download the video
            print(f"Downloading synchronized video from {video_url}...")
            response = requests.get(video_url)
            if response.status_code == 200:
                with open(video_path, "wb") as f:
                    f.write(response.content)
                print(f"Saved synchronized video to: {video_path}")
            else:
                print(f"Failed to download video: HTTP {response.status_code}")
        
        return result
    
    except Exception as e:
        print(f"Error in lipsync process: {str(e)}")
        return None

def parse_args():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(description="Synchronize audio with video using lipsync AI")
    
    # Input video options (must provide one)
    video_group = parser.add_mutually_exclusive_group(required=True)
    video_group.add_argument("--video-path", help="Path to local video file")
    video_group.add_argument("--video-url", help="URL to hosted video")
    
    # Input audio options (must provide one)
    audio_group = parser.add_mutually_exclusive_group(required=True)
    audio_group.add_argument("--audio-path", help="Path to local audio file")
    audio_group.add_argument("--audio-url", help="URL to hosted audio")
    
    # Output options
    parser.add_argument("--output-dir", default="./output",
                       help="Directory to save the output synchronized video")
    
    return parser.parse_args()

async def main_async():
    """Async entry point."""
    args = parse_args()
    
    await submit(
        video_path=args.video_path,
        video_url=args.video_url,
        audio_path=args.audio_path,
        audio_url=args.audio_url,
        output_dir=args.output_dir
    )
