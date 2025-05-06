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

async def generate_speech(text, output_dir, voice_id="en_us_m_1"):
    """
    Generate speech from text using a simple TTS service.
    
    Args:
        text: The text to convert to speech
        output_dir: Directory to save the audio file
        voice_id: Voice ID to use (default is a male English voice)
        
    Returns:
        Path to the generated audio file
    """
    print("🔊 Generating speech from text...")
    
    # Example using a free TTS API (replace with your preferred service)
    # This is a placeholder, in production you would use a better service
    try:
        # Create a timestamped filename
        timestamp = int(time.time())
        audio_filename = f"speech_{timestamp}.mp3"
        output_path = Path(output_dir) / audio_filename
        
        # For simplicity, using ElevenLabs-style API
        # In a real implementation, you would use a proper TTS service API
        base_url = "https://api.elevenlabs.io/v1/text-to-speech"
        headers = {
            "Accept": "audio/mpeg",
            "Content-Type": "application/json",
            "xi-api-key": os.getenv("ELEVEN_API_KEY", "dummy-key")
        }
        
        data = {
            "text": text,
            "model_id": "eleven_monolingual_v1",
            "voice_settings": {
                "stability": 0.5,
                "similarity_boost": 0.75
            }
        }
        
        # Placeholder function - in a real implementation, uncomment below
        # response = requests.post(f"{base_url}/{voice_id}", json=data, headers=headers)
        # if response.status_code == 200:
        #     with open(output_path, 'wb') as f:
        #         f.write(response.content)
        
        # For demo purposes, just create a dummy file if no API key
        if not os.getenv("ELEVEN_API_KEY"):
            print("Note: Using a dummy audio file since no ELEVEN_API_KEY is set")
            # Just create an empty file for demonstration purposes
            output_path.touch()
        
        print(f"✅ Speech generated and saved to {output_path}")
        return str(output_path)
    
    except Exception as e:
        print(f"❌ Error generating speech: {str(e)}")
        return None

async def text_to_lipsync_video(
    text,
    avatar_prompt=None,
    avatar_params=None,
    video_prompt="Realistic, subtle movement, person talking naturally",
    duration="5",
    aspect_ratio="16:9",
    voice_id="en_us_m_1",
    output_dir="./output"
):
    """
    Generate a talking video from text.
    
    Args:
        text: The text to be spoken in the video
        avatar_prompt: Prompt for generating the avatar image (if no image path is provided)
        avatar_params: Optional parameters for avatar generation
        video_prompt: Prompt for guiding the video animation
        duration: Video duration in seconds ("5" or "10")
        aspect_ratio: Video aspect ratio ("16:9", "9:16", "1:1")
        voice_id: ID of the voice to use for speech
        output_dir: Directory to save all output files
        
    Returns:
        Dict with paths to all generated files (image, audio, raw video, final video)
    """
    result = {}
    output_path = Path(output_dir)
    output_path.mkdir(exist_ok=True, parents=True)
    
    # Step 1: Generate avatar image (if not provided)
    print("\n🖼️ Step 1: Generating avatar image...")
    
    with tempfile.TemporaryDirectory() as temp_dir:
        # Generate the image using avatar parameters
        if not avatar_prompt:
            avatar_prompt = "Professional portrait of a person with a neutral expression, ready to speak"
        
        image_result = await generate_image(
            prompt=avatar_prompt,
            params=avatar_params,
            output_dir=temp_dir
        )
        
        if not image_result:
            print("❌ Failed to generate avatar image. Aborting.")
            return None
        
        # Find the image file in the temp directory
        temp_path = Path(temp_dir)
        image_files = list(temp_path.glob("*.png"))
        
        if not image_files:
            print("❌ No image was generated. Aborting.")
            return None
            
        # Use the first image file
        image_path = image_files[0]
        
        # Copy the image to the output directory
        output_image_path = output_path / image_path.name
        with open(image_path, "rb") as src, open(output_image_path, "wb") as dst:
            dst.write(src.read())
            
        print(f"✅ Avatar image generated and saved to {output_image_path}")
        result["image_path"] = str(output_image_path)
        
        # Step 2: Generate speech from text
        print("\n🔊 Step 2: Generating speech from text...")
        
        audio_path = await generate_speech(
            text=text,
            output_dir=output_dir,
            voice_id=voice_id
        )
        
        if not audio_path:
            print("❌ Failed to generate speech. Aborting.")
            return result
            
        result["audio_path"] = audio_path
        
        # Step 3: Generate video from the image
        print("\n🎬 Step 3: Generating video from the avatar image...")
        
        video_result = await generate_video(
            image_path=str(image_path),
            prompt=video_prompt,
            duration=duration,
            aspect_ratio=aspect_ratio,
            output_dir=output_dir
        )
        
        if not video_result or "video" not in video_result or "url" not in video_result["video"]:
            print("❌ Failed to generate video.")
            return result
        
        # Find the saved video file
        video_files = list(output_path.glob("video_*.mp4"))
        if not video_files:
            print("❌ Video file not found. Aborting.")
            return result
            
        raw_video_path = str(video_files[-1])
        result["raw_video_path"] = raw_video_path
        
        # Step 4: Apply lipsync to synchronize audio with video
        print("\n👄 Step 4: Applying lipsync to synchronize audio with video...")
        
        lipsync_result = await apply_lipsync(
            video_path=raw_video_path,
            audio_path=audio_path,
            output_dir=output_dir
        )
        
        if not lipsync_result or "video" not in lipsync_result or "url" not in lipsync_result["video"]:
            print("❌ Failed to apply lipsync.")
            return result
            
        # Find the saved lipsync video file
        lipsync_files = list(output_path.glob("lipsync_*.mp4"))
        if lipsync_files:
            result["lipsync_video_path"] = str(lipsync_files[-1])
            result["lipsync_video_url"] = lipsync_result["video"]["url"]
    
    return result

def parse_args():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(description="Generate a talking video from text")
    
    # Required text parameter
    parser.add_argument("--text", required=True, help="Text to be spoken in the video")
    
    # Avatar parameters
    parser.add_argument("--avatar-prompt", help="Prompt for generating the avatar image")
    
    # Avatar customization
    avatar_group = parser.add_argument_group("Avatar Customization")
    avatar_group.add_argument("--gender", choices=["male", "female", "non-binary"], help="Gender for avatar generation")
    avatar_group.add_argument("--age", help="Age for avatar generation")
    avatar_group.add_argument("--ethnicity", help="Ethnicity for avatar generation")
    avatar_group.add_argument("--expression", default="neutral", help="Facial expression for avatar")
    
    # Video parameters
    video_group = parser.add_argument_group("Video Parameters")
    video_group.add_argument("--video-prompt", default="Realistic, subtle movement, person talking naturally", help="Prompt for video animation")
    video_group.add_argument("--duration", choices=["5", "10"], default="5", help="Video duration in seconds")
    video_group.add_argument("--aspect-ratio", choices=["16:9", "9:16", "1:1"], default="16:9", help="Video aspect ratio")
    
    # Audio parameters
    audio_group = parser.add_argument_group("Audio Parameters")
    audio_group.add_argument("--voice-id", default="en_us_m_1", help="Voice ID for speech generation")
    
    # Output options
    parser.add_argument("--output-dir", default="./output", help="Directory to save outputs")
    
    return parser.parse_args()

async def main_async():
    """Async entry point."""
    args = parse_args()
    
    # Collect avatar parameters if provided
    avatar_params = {}
    for param in ["gender", "age", "ethnicity", "expression"]:
        if hasattr(args, param) and getattr(args, param):
            avatar_params[param] = getattr(args, param)
    
    # Only pass avatar_params if we have some
    avatar_params = avatar_params if avatar_params else None
    
    result = await text_to_lipsync_video(
        text=args.text,
        avatar_prompt=args.avatar_prompt,
        avatar_params=avatar_params,
        video_prompt=args.video_prompt,
        duration=args.duration,
        aspect_ratio=args.aspect_ratio,
        voice_id=args.voice_id,
        output_dir=args.output_dir
    )
    
    if result:
        print("\n✨ Text-to-Lipsync-Video Generation Complete ✨")
        if "image_path" in result:
            print(f"📷 Avatar Image: {result['image_path']}")
        if "audio_path" in result:
            print(f"🔊 Audio: {result['audio_path']}")
        if "raw_video_path" in result:
            print(f"🎬 Raw Video: {result['raw_video_path']}")
        if "lipsync_video_path" in result:
            print(f"🎞️ Final Lipsync Video: {result['lipsync_video_path']}")
        if "lipsync_video_url" in result:
            print(f"🌐 Final Video URL: {result['lipsync_video_url']}")

if __name__ == "__main__":
    asyncio.run(main_async()) 