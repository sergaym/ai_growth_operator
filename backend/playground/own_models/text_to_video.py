#!/usr/bin/env python
"""
Text to Video - A utility script that combines text-to-image and image-to-video
to create a complete text-to-video pipeline.
"""

import argparse
import asyncio
import os
import tempfile
from pathlib import Path

from text_image import submit as generate_image
from image_to_video import submit as generate_video

async def text_to_video(
    prompt,
    avatar_params=None,
    video_prompt=None,
    duration="5",
    aspect_ratio="16:9",
    negative_prompt="blur, distort, and low quality",
    cfg_scale=0.5,
    output_dir="./output"
):
    """
    Generate a video from a text prompt by first generating an image and then animating it.
    
    Args:
        prompt: Text prompt for image generation
        avatar_params: Optional parameters for avatar generation
        video_prompt: Optional specific prompt for video generation (defaults to image prompt)
        duration: Video duration in seconds ("5" or "10")
        aspect_ratio: Aspect ratio of the output video ("16:9", "9:16", "1:1")
        negative_prompt: Negative prompt for video generation
        cfg_scale: How closely to follow the prompt (0.0-1.0)
        output_dir: Directory to save outputs
        
    Returns:
        Dict with paths to the generated image and video
    """
    result = {}
