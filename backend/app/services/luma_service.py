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

