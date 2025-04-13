"""
Luma AI service integration for the AI Growth Operator.
This module provides all interactions with the Luma AI API for video generation.
"""

import os
import time
import uuid
import requests
from typing import Dict, List, Any, Optional
from dotenv import load_dotenv
from lumaai import LumaAI

# Import settings
from app.core.config import settings

# Load environment variables
load_dotenv()

# Luma AI API constants
LUMA_API_KEY = os.getenv("LUMAAI_API_KEY")
LUMA_POLLING_INTERVAL = 10  # seconds

# Initialize the Luma AI client
def get_luma_client():
    """Get a configured Luma AI client instance"""
    api_key = LUMA_API_KEY or settings.LUMAAI_API_KEY
    if not api_key:
        raise ValueError("Luma AI API key not found. Please set LUMAAI_API_KEY in your environment.")
    
    return LumaAI(auth_token=api_key)

def generate_video(
    prompt: str,
    visual_style: Optional[str] = None,
    duration: str = "30 seconds",
    aspect_ratio: str = "16:9",
    music_type: Optional[str] = None,
    include_text_overlays: bool = True,
    media_references: Optional[List[Dict[str, Any]]] = None
) -> Dict[str, Any]:
    """
    Generate a video using Luma AI based on a prompt.
    
    Args:
        prompt: The detailed prompt describing the video to generate
        visual_style: Visual style for the video (optional)
        duration: Target duration of the video (optional)
        aspect_ratio: Aspect ratio of the video (optional)
        music_type: Type of background music (optional)
        include_text_overlays: Whether to include text overlays (optional)
        media_references: List of reference images or videos (optional)
        
    Returns:
        Dictionary containing the video generation details
    """
    client = get_luma_client()
    
    # Enhance the prompt based on visual style if provided
    enhanced_prompt = prompt
    if visual_style:
        enhanced_prompt = f"{visual_style.title()} style: {prompt}"
    
    # Add duration information to the prompt
    enhanced_prompt = f"{enhanced_prompt} The video should be approximately {duration} long."
    
    # Parse duration for the SDK
    duration_formatted = _format_duration_for_sdk(duration)
    
    # Add music information if provided
    if music_type:
        enhanced_prompt = f"{enhanced_prompt} The video should have {music_type} music."
    
    # Prepare generation parameters
    params = {
        "prompt": enhanced_prompt,
        "model": "ray-2",  # Using Ray 2 for best quality
        "duration": duration_formatted,
        "aspect_ratio": aspect_ratio,
    }
    
    # Add keyframes for reference media if provided
    if media_references and len(media_references) > 0:
        keyframes = {}
        for i, ref in enumerate(media_references):
            if ref["type"].lower() == "image":
                # Add image as a keyframe
                frame_key = f"frame{i}"
                keyframes[frame_key] = {
                    "type": "image",
                    "url": ref["url"]
                }
                
                # Add weight if provided
                if "weight" in ref:
                    keyframes[frame_key]["weight"] = ref["weight"]
        
        if keyframes:
            params["keyframes"] = keyframes
    
    # Generate a unique ID to track this generation
    generation_id = str(uuid.uuid4())
    
    try:
        # Create the generation
        generation = client.generations.create(**params)
        
        # Return initial response with generation details
        result = {
            "generation_id": generation.id,
            "prompt_used": enhanced_prompt,
            "status": "processing",
            "estimated_completion_time": _estimate_completion_time(_parse_duration_to_seconds(duration)),
            "duration": duration
        }
        
        return result
    
    except Exception as e:
        raise Exception(f"Error in Luma AI generation: {str(e)}")

def generate_video_with_references(
    prompt: str,
    media_references: List[Dict[str, Any]],
    settings: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Generate a video using specific media references (images/videos) as style or content guides.
    
    Args:
        prompt: The detailed prompt describing the video to generate
        media_references: List of reference media (images or videos)
        settings: Dictionary of video generation settings
        
    Returns:
        Dictionary containing the video generation details
    """
    # Extract settings
    visual_style = settings.get("visual_style")
    duration = settings.get("duration", "30 seconds")
    aspect_ratio = settings.get("aspect_ratio", "16:9")
    music_type = settings.get("music_type")
    include_text_overlays = settings.get("include_text_overlays", True)
    
    # Use the main generate_video function with the media references
    return generate_video(
        prompt=prompt,
        visual_style=visual_style,
        duration=duration,
        aspect_ratio=aspect_ratio,
        music_type=music_type,
        include_text_overlays=include_text_overlays,
        media_references=media_references
    )

def check_video_status(generation_id: str) -> Dict[str, Any]:
    """
    Check the status of a video generation job.
    
    Args:
        generation_id: The unique ID of the generation job
        
    Returns:
        Dictionary containing the latest status
    """
    client = get_luma_client()
    
    try:
        # Get the generation status
        generation = client.generations.get(id=generation_id)
        
        # Determine the status and extract relevant information
        if generation.state == "completed":
            result = {
                "status": "completed",
                "video_url": generation.assets.video,
                "thumbnail_url": getattr(generation.assets, "thumbnail", None),
                "generation_id": generation_id,
                "duration": getattr(generation, "duration", "Unknown"),
                "prompt_used": generation.prompt
            }
        elif generation.state == "failed":
            result = {
                "status": "failed",
                "generation_id": generation_id,
                "error": getattr(generation, "failure_reason", "Unknown error")
            }
        else:
            result = {
                "status": "processing",
                "generation_id": generation_id,
                "estimated_completion_time": _estimate_completion_time(30)  # Default estimate
            }
        
        return result
        
    except Exception as e:
        raise Exception(f"Error checking video status: {str(e)}")

def wait_for_video_completion(generation_id: str, timeout: int = 300) -> Dict[str, Any]:
    """
    Poll the video generation status until completion or timeout.
    
    Args:
        generation_id: The unique ID of the generation job
        timeout: Maximum time to wait in seconds (default: 300s / 5min)
        
    Returns:
        Dictionary containing the completed video details
    """
    client = get_luma_client()
    
    start_time = time.time()
    
    while time.time() - start_time < timeout:
        # Get the generation status
        generation = client.generations.get(id=generation_id)
        
        if generation.state == "completed":
            return {
                "status": "completed",
                "video_url": generation.assets.video,
                "thumbnail_url": getattr(generation.assets, "thumbnail", None),
                "generation_id": generation_id,
                "duration": getattr(generation, "duration", "Unknown"),
                "prompt_used": generation.prompt
            }
        elif generation.state == "failed":
            return {
                "status": "failed",
                "generation_id": generation_id,
                "error": getattr(generation, "failure_reason", "Unknown error")
            }
        
        # Wait before polling again
        time.sleep(LUMA_POLLING_INTERVAL)
    
    # If we reach here, we've timed out
    return {
        "status": "timeout",
        "generation_id": generation_id,
        "message": f"Video generation timed out after {timeout} seconds"
    }

def _parse_duration_to_seconds(duration: str) -> int:
    """
    Parse a duration string like "30 seconds" or "1 minute" to seconds.
    
    Args:
        duration: Duration string
        
    Returns:
        Duration in seconds
    """
    duration = duration.lower().strip()
    
    if "second" in duration:
        seconds = duration.split("second")[0].strip()
        return int(seconds)
    elif "minute" in duration:
        minutes = duration.split("minute")[0].strip()
        return int(minutes) * 60
    else:
        # Default to 30 seconds if format is unrecognized
        return 30

def _format_duration_for_sdk(duration: str) -> str:
    """
    Format duration string to the format expected by the Luma SDK.
    
    Args:
        duration: Duration string (e.g., "30 seconds", "1 minute")
        
    Returns:
        Formatted duration (e.g., "5s", "9s")
    """
    # Luma SDK currently only supports specific durations
    # Based on the error message, it seems to accept values like "5s" and "9s"
    VALID_DURATIONS = ["5s", "9s"]
    
    duration = duration.lower().strip()
    
    # Try to extract a numeric value and unit
    if "second" in duration:
        seconds = duration.split("second")[0].strip()
        formatted = f"{seconds}s"
    elif "minute" in duration:
        minutes = duration.split("minute")[0].strip()
        # Convert minutes to seconds
        formatted = f"{int(minutes) * 60}s"
    else:
        # Default if format is unrecognized
        formatted = "5s"
    
    # Check if the formatted duration is valid, otherwise use the closest valid duration
    if formatted in VALID_DURATIONS:
        return formatted
    
    # If not a valid duration, default to the closest available option
    seconds = int(formatted.rstrip('s'))
    if seconds <= 5:
        return "5s"
    else:
        return "9s"
