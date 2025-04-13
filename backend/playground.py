#!/usr/bin/env python
"""
Playground script for testing the AI Growth Operator video generation capabilities.

This script demonstrates how to use the Luma AI video generator to create videos
from text prompts with different styles and camera motions.

Usage:
    python playground.py

Note: Make sure you have set your LUMAAI_API_KEY in the .env file
"""

import os
import sys
import time
from datetime import datetime

# Add the src directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import the video generator module
from backend.video_generator import LumaVideoGenerator
from backend.utils.prompt_utils import (
    enhance_prompt, 
    get_available_styles, 
    get_available_camera_motions
)

def display_separator():
    """Display a separator line"""
    print("\n" + "=" * 80 + "\n")

def display_greeting():
    """Display a greeting message"""
    print("\n🚀 AI Growth Operator - Video Generation Playground")
    print("=" * 60)
    print("This playground allows you to generate videos using Luma AI's API.")
    print("Make sure you have set your LUMAAI_API_KEY in the .env file.")
    print("=" * 60 + "\n")

def display_available_options():
    """Display available styles and camera motions"""
    print("\n📋 Available Video Styles:")
    for i, style in enumerate(get_available_styles(), 1):
        print(f"  {i}. {style}")
    
    print("\n🎥 Available Camera Motions:")
    for i, motion in enumerate(get_available_camera_motions(), 1):
        print(f"  {i}. {motion}")
    print()

def get_user_input():
    """Get user input for video generation"""
    base_prompt = input("Enter your video prompt: ")
    
    # Get style selection
    print("\nSelect a video style (or press Enter for none):")
    styles = get_available_styles()
    for i, style in enumerate(styles, 1):
        print(f"  {i}. {style}")
    
    style_choice = input("\nEnter style number (or press Enter for none): ")
    selected_style = None
    if style_choice.strip() and style_choice.isdigit():
        style_idx = int(style_choice) - 1
        if 0 <= style_idx < len(styles):
            selected_style = styles[style_idx]
    
    # Get camera motion selection
    print("\nSelect a camera motion (or press Enter for none):")
    motions = get_available_camera_motions()
    for i, motion in enumerate(motions, 1):
        print(f"  {i}. {motion}")
    
    motion_choice = input("\nEnter motion number (or press Enter for none): ")
    selected_motion = None
    if motion_choice.strip() and motion_choice.isdigit():
        motion_idx = int(motion_choice) - 1
        if 0 <= motion_idx < len(motions):
            selected_motion = motions[motion_idx]
    
    # Get additional details
    additional_details = input("\nEnter any additional details (or press Enter for none): ")
    
    # Get video duration
    duration = input("\nEnter video duration in seconds (default: 5): ")
    duration = f"{duration}s" if duration.strip() and duration.isdigit() else "5s"
    
    # Get video resolution
    print("\nSelect video resolution:")
    print("  1. 540p")
    print("  2. 720p")
    print("  3. 1080p")
    print("  4. 4k")
    
    resolution_choice = input("\nEnter resolution number (default: 2 for 720p): ")
    resolution_map = {
        "1": "540p",
        "2": "720p",
        "3": "1080p",
        "4": "4k"
    }
    resolution = resolution_map.get(resolution_choice.strip(), "720p")
    
    # Loop option
    loop_choice = input("\nCreate looping video? (y/n, default: n): ")
    loop = loop_choice.lower().startswith('y')
    
    return {
        "base_prompt": base_prompt,
        "style": selected_style,
        "camera_motion": selected_motion,
        "additional_details": additional_details if additional_details.strip() else None,
        "duration": duration,
        "resolution": resolution,
        "loop": loop
    }

def generate_video(options):
    """Generate a video using the provided options"""
    try:
        # Enhance the prompt with style, camera motion, and additional details
        enhanced_prompt = enhance_prompt(
            options["base_prompt"],
            options["style"],
            options["camera_motion"],
            options["additional_details"]
        )
        
        print(f"\n🔮 Enhanced prompt: \"{enhanced_prompt}\"")
        
        # Initialize the video generator
        generator = LumaVideoGenerator()
        
        # Start the generation process
        print("\n🎬 Starting video generation...")
        start_time = time.time()
        
        # Generate the video
        generation = generator.generate_video_from_text(
            prompt=enhanced_prompt,
            resolution=options["resolution"],
            duration=options["duration"],
            loop=options["loop"]
        )
        
        end_time = time.time()
        
        # Display the results
        print(f"\n✅ Video generation completed in {end_time - start_time:.2f} seconds!")
        print(f"📺 Video URL: {generation.assets.video}")
        
        if hasattr(generation, 'local_file_path'):
            print(f"💾 Video saved locally to: {generation.local_file_path}")
        
        return generation
        
    except Exception as e:
        print(f"\n❌ Error generating video: {str(e)}")
        return None

def main():
    """Main function to run the playground"""
    display_greeting()
    
    while True:
        display_separator()
        options = get_user_input()
        
        display_separator()
        generate_video(options)
        
        display_separator()
        again = input("\nGenerate another video? (y/n): ")
        if not again.lower().startswith('y'):
            break
    
    print("\n👋 Thank you for using the AI Growth Operator Video Generation Playground!")

if __name__ == "__main__":
    main() 