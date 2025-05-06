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
    output_path = Path(output_dir)
    output_path.mkdir(exist_ok=True, parents=True)
    
    # Step 1: Generate image from text
    print("🖼️ Step 1: Generating image from text prompt...")
    
    with tempfile.TemporaryDirectory() as temp_dir:
        # Generate the image
        image_result = await generate_image(
            prompt=prompt,
            params=avatar_params,
            output_dir=temp_dir
        )
        
        if not image_result:
            print("❌ Failed to generate image. Aborting.")
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
            
        print(f"✅ Image generated and saved to {output_image_path}")
        result["image_path"] = str(output_image_path)
        
        # Step 2: Generate video from the image
        print("🎬 Step 2: Generating video from the image...")
        
        # Use the same prompt for video if not specified
        if not video_prompt:
            video_prompt = f"Realistic animation of: {prompt}"
        
        video_result = await generate_video(
            image_path=str(image_path),
            prompt=video_prompt,
            duration=duration,
            aspect_ratio=aspect_ratio,
            negative_prompt=negative_prompt,
            cfg_scale=cfg_scale,
            output_dir=output_dir
        )
        
        if not video_result:
            print("❌ Failed to generate video.")
            return result
        
        if "video" in video_result and "url" in video_result["video"]:
            print(f"✅ Video generated successfully")
            result["video_url"] = video_result["video"]["url"]
            
            # Find the saved video file
            video_files = list(output_path.glob("video_*.mp4"))
            if video_files:
                result["video_path"] = str(video_files[-1])
    
    return result

