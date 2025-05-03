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
FAL_KEY = os.getenv("FAL_KEY") or os.getenv("FAL_API_KEY") or os.getenv("FAL_CLIENT_API")
if not FAL_KEY:
    print("Error: No FAL API key found. Please set FAL_KEY environment variable.")
    print("Get your API key from: https://app.fal.ai/settings/api-keys")
    sys.exit(1)

# Set the environment variable fal-client expects
os.environ["FAL_KEY"] = FAL_KEY

async def submit(prompt, output_dir=None):
    """Submit an image generation request to fal.ai and save the result."""
    print(f"Generating image with prompt: {prompt}")
    
    try:
        # Submit the request
        handler = await fal_client.submit_async(
            "fal-ai/flux/dev",
            arguments={
                "prompt": prompt
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
                        filename = f"image_{timestamp}_{i}.png"
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
                            filename = f"image_{timestamp}_{i}.png"
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
    parser = argparse.ArgumentParser(description="Generate images using fal.ai")
    
    parser.add_argument(
        "--prompt",
        default="Find a real actor (25–35 years old) with a naturally charismatic presence, able to speak directly to camera in a warm, relatable tone. The actor should look authentic, not overly polished—someone who feels like a trusted peer. They must have clear facial expressions, excellent micro-expression control, and speak fluently and casually as if explaining something to a friend. Appearance should be clean and modern: casual clothing (T-shirt, hoodie), neutral background or soft indoor setting, and soft natural lighting. Prioritize diversity and inclusivity. The final output must feel native to platforms like TikTok or Instagram, not scripted or corporate.",
        help="Prompt for image generation"
    )
    
    parser.add_argument(
        "--output-dir",
        default="./output",
        help="Directory to save generated images"
    )
    
    return parser.parse_args()

async def main_async():
    """Async entry point."""
    args = parse_args()
    await submit(args.prompt, args.output_dir)

if __name__ == "__main__":
    asyncio.run(main_async())