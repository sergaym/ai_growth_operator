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

def build_avatar_prompt(
    gender=None,
    age=None,
    ethnicity=None, 
    skin_tone=None,
    hair_style=None,
    hair_color=None,
    facial_features=None,
    expression=None,
    style=None,
    background=None,
    lighting=None,
    custom_prompt=None
):
    """Build a comprehensive prompt for avatar generation based on parameters."""
    
    # Base prompt structure
    base_prompt = "Generate a hyperrealistic portrait of a"
    
    # Add gender
    if gender:
        if gender.lower() in ["male", "man"]:
            base_prompt += " man"
        elif gender.lower() in ["female", "woman"]:
            base_prompt += " woman"
        elif gender.lower() == "non-binary":
            base_prompt += " non-binary person"
        else:
            base_prompt += f" person with {gender} gender expression"
    else:
        base_prompt += " person"
    
    # Add age
    if age:
        if age.isdigit():
            base_prompt += f", {age} years old"
        else:
            base_prompt += f", {age}"
    
    # Add ethnicity/cultural background
    if ethnicity:
        base_prompt += f" of {ethnicity} descent"
    
    # Add skin tone
    if skin_tone:
        base_prompt += f" with {skin_tone} skin tone"
    
    # Add hair details
    hair_details = []
    if hair_style:
        hair_details.append(hair_style)
    if hair_color:
        hair_details.append(f"{hair_color} colored")
    
    if hair_details:
        hair_text = " and ".join(hair_details)
        base_prompt += f", {hair_text} hair"
    
    # Add facial features
    if facial_features:
        base_prompt += f", {facial_features}"
    
    # Add expression
    if expression:
        base_prompt += f", with a {expression} expression"
    
    # Add style specifications
    base_prompt += ". The portrait should be extremely photorealistic"
    if style:
        base_prompt += f", in {style} style"
    
    # Add background
    if background:
        base_prompt += f" with {background} background"
    
    # Add lighting
    if lighting:
        base_prompt += f" and {lighting} lighting"
    
    # Professional quality specifications
    base_prompt += ". Professional portrait photography, 8k, extremely detailed facial features, suitable for professional video avatars."
    
    # Add custom prompt elements at the end if provided
    if custom_prompt:
        base_prompt += f" {custom_prompt}"
    
    return base_prompt

async def submit(prompt=None, params=None, output_dir=None):
    """Submit an image generation request to fal.ai and save the result."""
    
    # Build prompt from parameters if provided
    if params:
        generated_prompt = build_avatar_prompt(**params)
        prompt = generated_prompt
    
    print(f"Generating image with prompt: {prompt}")
    
    try:
        # Submit the request with additional parameters for better face generation
        handler = await fal_client.submit_async(
            "fal-ai/flux/dev",
            arguments={
                "prompt": prompt,
                "negative_prompt": "deformed faces, unrealistic features, cartoon-like, illustration, painting, drawing, artificial looking, low quality, blurry",
                "num_inference_steps": 50,  # Higher step count for better quality
                "guidance_scale": 7.5,      # Higher guidance for closer adherence to prompt
            },
        )

        print(f"Request ID: {handler.request_id}")
        
        # Process events (logs if available)
        try:
            async for event in handler.iter_events(with_logs=True):
                if "logs" in event and event["logs"].strip():
                    print(f"Log: {event['logs'].strip()}")
        except Exception as e:
            print(f"Note: Could not stream progress logs: {e}")

        # Get the final result
        result = await handler.get()
        print("Generation completed successfully!")
        
        # Save the image if we have output_dir
        if output_dir:
            # Create output directory if it doesn't exist
            output_path = Path(output_dir)
            output_path.mkdir(exist_ok=True, parents=True)
            
            # Try to extract and save the image
            image_saved = False
            
            # Check for different response formats
            if "images" in result and isinstance(result["images"], list) and result["images"]:
                for i, image_data in enumerate(result["images"]):
                    if isinstance(image_data, str):
                        # Handle base64 image
                        if "," in image_data and ";base64," in image_data:
                            image_data = image_data.split(";base64,")[1]
                        
                        image_bytes = base64.b64decode(image_data)
                        timestamp = int(time.time())
                        filename = f"avatar_{timestamp}_{i}.png"
                        filepath = output_path / filename
                        
                        with open(filepath, "wb") as f:
                            f.write(image_bytes)
                        
                        print(f"Saved image to: {filepath}")
                        image_saved = True
                    elif isinstance(image_data, dict) and "url" in image_data:
                        # Handle URL image
                        url = image_data["url"]
                        response = requests.get(url)
                        if response.status_code == 200:
                            timestamp = int(time.time())
                            filename = f"avatar_{timestamp}_{i}.png"
                            filepath = output_path / filename
                            
                            with open(filepath, "wb") as f:
                                f.write(response.content)
                            
                            print(f"Saved image to: {filepath}")
                            image_saved = True
            
            if not image_saved:
                print("Warning: Could not extract image from response")
                print(f"Response keys: {list(result.keys())}")
        
        return result
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return None

def parse_args():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(description="Generate hyperrealistic avatar images using fal.ai")
    
    # Basic arguments
    parser.add_argument(
        "--prompt", 
        help="Custom prompt for image generation (will override other parameters)"
    )
    
    parser.add_argument(
        "--output-dir",
        default="./output",
        help="Directory to save generated images"
    )
    
    # Avatar parameter arguments
    parser.add_argument("--gender", choices=["male", "female", "non-binary", "custom"], help="Gender of the avatar")
    parser.add_argument("--age", help="Age of the avatar (e.g., '25', 'middle-aged', 'elderly')")
    parser.add_argument("--ethnicity", help="Ethnicity or cultural background (e.g., 'African', 'East Asian', 'European')")
    parser.add_argument("--skin-tone", help="Skin tone (e.g., 'dark', 'medium', 'light', 'olive')")
    parser.add_argument("--hair-style", help="Hair style (e.g., 'short', 'long', 'curly', 'straight')")
    parser.add_argument("--hair-color", help="Hair color (e.g., 'black', 'blonde', 'brown', 'red')")
    parser.add_argument("--facial-features", help="Notable facial features (e.g., 'strong jawline', 'high cheekbones')")
    parser.add_argument("--expression", help="Facial expression (e.g., 'neutral', 'smiling', 'serious')")
    parser.add_argument("--style", help="Visual style (e.g., 'studio', 'natural', 'cinematic')")
    parser.add_argument("--background", help="Background description (e.g., 'neutral', 'office', 'gradient')")
    parser.add_argument("--lighting", help="Lighting description (e.g., 'soft', 'dramatic', 'natural')")
    
    return parser.parse_args()

async def main_async():
    """Async entry point."""
    args = parse_args()
    await submit(args.prompt, args.output_dir)

if __name__ == "__main__":
    asyncio.run(main_async())