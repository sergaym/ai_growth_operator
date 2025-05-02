# -*- coding: utf-8 -*-
"""backend.playground.own_models.text_to_image
================================================
Production-grade text-to-image generator using fal.ai's Stable Diffusion XL models.

This script demonstrates how to use fal.ai's Stable Diffusion API to generate high-quality
images from text prompts, with proper error handling, CLI arguments, and async execution.

Usage
-----
Run from the project root after setting the FAL_KEY environment variable:

>>> python -m backend.playground.own_models.text_to_image \
        --prompt "A serene mountain lake at sunset" \
        --width 1024 \
        --height 1024 \
        --samples 1 \
        --model "fal-ai/fast-sdxl"

This will:
1. Connect to fal.ai's API using your credentials
2. Generate an image based on your prompt
3. Save the image to disk

You can obtain your FAL_KEY at: https://app.fal.ai/settings/api-keys
"""
from __future__ import annotations

import argparse
import asyncio
import base64
import os
import sys
import time
from pathlib import Path
from typing import Dict, Any, Optional, List, Union

import fal_client
from dotenv import load_dotenv
import requests

# Add parent directories to path for imports
ROOT_DIR = Path(__file__).resolve().parents[3]  # ai-ugc root
BACKEND_DIR = Path(__file__).resolve().parents[2]  # backend directory
for p in (ROOT_DIR, BACKEND_DIR):
    if str(p) not in sys.path:
        sys.path.append(str(p))

# ---------------------------------------------------------------------------
# Environment setup
# ---------------------------------------------------------------------------
load_dotenv()  # Load .env if present

# Validate API key early - check multiple possible environment variables
FAL_KEY = os.getenv("FAL_KEY") or os.getenv("FAL_API_KEY") or os.getenv("FAL_CLIENT_API")
if not FAL_KEY:
    print("\033[91mError: No FAL API key found.\033[0m")
    print("You can get your API key from: https://app.fal.ai/settings/api-keys")
    print("Then set it as one of these environment variables or add to your .env file:\n")
    print("    export FAL_KEY=your-key-here")
    print("    export FAL_API_KEY=your-key-here")
    print("    export FAL_CLIENT_API=your-key-here\n")
    sys.exit(1)

# Set the environment variable fal-client expects
os.environ["FAL_KEY"] = FAL_KEY

class ImageGenerator:
    """High-level wrapper for fal.ai's Stable Diffusion API."""

    # Available models with their max dimensions
    AVAILABLE_MODELS = {
        "fal-ai/fast-sdxl": (1024, 1024),  # Fast inference
        "fal-ai/stable-diffusion-v35-large": (1024, 1024),  # High-quality
        "fal-ai/realistic-vision-v5": (1024, 1024),  # Photorealism
        "fal-ai/stable-diffusion-xl-turbo": (1024, 1024),  # Lower latency  
    }
    
    # Model-specific scheduler options
    MODEL_SCHEDULERS = {
        "fal-ai/fast-sdxl": ["DPM++ 2M", "DPM++ 2M Karras", "DPM++ 2M SDE", "DPM++ 2M SDE Karras", 
                             "DPM++ SDE", "DPM++ SDE Karras", "KDPM 2A", "Euler", 
                             "Euler (trailing timesteps)", "Euler A", "LCM",
                             "EDMDPMSolverMultistepScheduler", "TCDScheduler"],
        "fal-ai/stable-diffusion-v35-large": ["K_EULER", "K_EULER_ANCESTRAL", "K_HEUN", "K_DPM_2", 
                                               "K_DPM_2_ANCESTRAL", "K_DPM_FAST", "K_DPM_ADAPTIVE", 
                                               "K_LMS", "K_DPMPP_2S_ANCESTRAL", "K_DPMPP_2M"],
        "fal-ai/realistic-vision-v5": ["K_EULER", "K_EULER_ANCESTRAL", "K_DPM_2_ANCESTRAL"],
        "fal-ai/stable-diffusion-xl-turbo": ["Euler A", "DPM++ 2M Karras"],
    }
    
    # Default schedulers by model
    DEFAULT_SCHEDULERS = {
        "fal-ai/fast-sdxl": "Euler A",
        "fal-ai/stable-diffusion-v35-large": "K_EULER_ANCESTRAL",
        "fal-ai/realistic-vision-v5": "K_EULER_ANCESTRAL",
        "fal-ai/stable-diffusion-xl-turbo": "Euler A",
    }

    def __init__(
        self,
        model: str = "fal-ai/fast-sdxl",
        width: int = 1024,
        height: int = 1024,
        output_dir: Optional[str] = None,
    ):
        """Initialize the image generator.

        Args:
            model: Which fal.ai model to use
            width: Image width (must be multiple of 8)
            height: Image height (must be multiple of 8) 
            output_dir: Directory to save images (default: ./output)
        """
        if model not in self.AVAILABLE_MODELS:
            raise ValueError(
                f"Model {model} not recognized. Available models: {list(self.AVAILABLE_MODELS.keys())}"
            )

        # Ensure dimensions are valid
        self.model = model
        self.width = self._validate_dimension(width, "width")
        self.height = self._validate_dimension(height, "height")

        # Set up output directory
        if output_dir:
            self.output_dir = Path(output_dir)
        else:
            self.output_dir = Path(__file__).parent / "output"
        self.output_dir.mkdir(exist_ok=True, parents=True)

    @staticmethod
    def _validate_dimension(value: int, dim_name: str) -> int:
        """Ensure dimensions are multiples of 8 and within bounds."""
        if value % 8 != 0:
            print(f"Warning: {dim_name} {value} is not a multiple of 8. Rounding to {value - value % 8}")
            value = value - value % 8
        
        if value < 512:
            print(f"Warning: {dim_name} {value} is too small. Setting to minimum of 512")
            value = 512
        
        if value > 1024:
            print(f"Warning: {dim_name} {value} is too large. Setting to maximum of 1024")
            value = 1024
            
        return value

    async def generate_image(
        self, 
        prompt: str, 
        negative_prompt: str = "",
        num_samples: int = 1,
        scheduler: Optional[str] = None,
        guidance_scale: float = 7.5,
        num_inference_steps: int = 25,
        seed: Optional[int] = None,
    ) -> List[Dict[str, Any]]:
        """Generate image from prompt using the fal.ai API.

        Args:
            prompt: Text description of the desired image
            negative_prompt: Elements to avoid in the image
            num_samples: Number of images to generate
            scheduler: The diffusion scheduler to use
            guidance_scale: How closely to follow the prompt (higher = more faithful)
            num_inference_steps: Number of denoising steps (more = higher quality but slower)
            seed: Random seed for reproducibility

        Returns:
            List of dicts containing image data and metadata
        """
        print(f"\n[fal.ai] Generating {num_samples} image(s) with '{self.model}'")
        print(f"[fal.ai] Prompt: {prompt}")
        
        # Use model-specific scheduler if none provided
        if scheduler is None:
            scheduler = self.DEFAULT_SCHEDULERS.get(self.model, "Euler A")
        
        # Validate scheduler for current model
        valid_schedulers = self.MODEL_SCHEDULERS.get(self.model, [])
        if valid_schedulers and scheduler not in valid_schedulers:
            print(f"[fal.ai] Warning: Scheduler '{scheduler}' not supported for model '{self.model}'")
            print(f"[fal.ai] Using default scheduler '{self.DEFAULT_SCHEDULERS.get(self.model)}'")
            scheduler = self.DEFAULT_SCHEDULERS.get(self.model, "Euler A")
        
        print(f"[fal.ai] Using scheduler: {scheduler}")
        
        start_time = time.time()
        
        # Prepare the arguments based on the model
        arguments = {
            "prompt": prompt,
            "negative_prompt": negative_prompt,
            "width": self.width,
            "height": self.height,
            "num_images": min(num_samples, 4),  # API limit
            "scheduler": scheduler,
            "guidance_scale": guidance_scale,
            "num_inference_steps": num_inference_steps,
        }
        
        if seed is not None:
            arguments["seed"] = seed

        try:
            # Submit the generation request
            handler = await fal_client.submit_async(
                self.model,
                arguments=arguments,
            )

            # Wait for the request to complete
            result_data = await self._process_generation(handler)
            
            elapsed = time.time() - start_time
            print(f"[fal.ai] Generation completed in {elapsed:.2f}s ✅")
            
            # DEBUGGING: Create a detailed debug file with the full response
            debug_file = self.output_dir / f"debug_response_{int(time.time())}.json"
            print(f"[fal.ai] Saving full response to {debug_file}")
            with open(debug_file, "w") as f:
                import json
                json.dump(result_data, f, indent=2)
            
            # Save results
            results = []
            
            # Different models return different response structures
            if "images" in result_data:
                images_data = result_data.get("images", [])
                # Handle nested arrays or direct objects
                if isinstance(images_data, list):
                    if len(images_data) > 0:
                        print(f"[fal.ai] Found {len(images_data)} images in response")
                        for i, image_data in enumerate(images_data):
                            # Different models might return different structures
                            if isinstance(image_data, dict) and "image" in image_data:
                                # Handle structure: {"images": [{"image": "data:image/..."}]}
                                image_b64 = image_data.get("image", "")
                                if not image_b64:
                                    continue
                                
                                # Save the image
                                filename = self._save_image(image_b64, i)
                                results.append({
                                    "filename": filename,
                                    "path": str(self.output_dir / filename),
                                    "seed": image_data.get("seed", seed) or result_data.get("seed"),
                                    "width": self.width,
                                    "height": self.height,
                                })
                            elif isinstance(image_data, dict) and "file_path" in image_data:
                                # Special case for fast-sdxl which returns file_path rather than embedded images
                                file_path = image_data.get("file_path", "")
                                if not file_path:
                                    continue
                                
                                print(f"[fal.ai] Image available at URL: {file_path}")
                                # Download the image from the URL
                                try:
                                    response = requests.get(file_path)
                                    if response.status_code == 200:
                                        timestamp = int(time.time())
                                        filename = f"image_{timestamp}_{i}.png"
                                        filepath = self.output_dir / filename
                                        
                                        with open(filepath, "wb") as f:
                                            f.write(response.content)
                                        
                                        print(f"[fal.ai] Downloaded image to {filepath}")
                                        results.append({
                                            "filename": filename,
                                            "path": str(filepath),
                                            "url": file_path,
                                            "seed": image_data.get("seed", seed) or result_data.get("seed"),
                                            "width": self.width,
                                            "height": self.height,
                                        })
                                    else:
                                        print(f"[fal.ai] Failed to download image from {file_path}: HTTP {response.status_code}")
                                except Exception as e:
                                    print(f"[fal.ai] Error downloading image from {file_path}: {str(e)}")
                            elif isinstance(image_data, dict) and "url" in image_data:
                                # Another format with 'url' instead of 'file_path' or 'image'
                                img_url = image_data.get("url", "")
                                if not img_url:
                                    continue
                                
                                print(f"[fal.ai] Image available at URL: {img_url}")
                                # Download the image from the URL
                                try:
                                    response = requests.get(img_url)
                                    if response.status_code == 200:
                                        timestamp = int(time.time())
                                        filename = f"image_{timestamp}_{i}.png"
                                        filepath = self.output_dir / filename
                                        
                                        with open(filepath, "wb") as f:
                                            f.write(response.content)
                                        
                                        print(f"[fal.ai] Downloaded image to {filepath}")
                                        results.append({
                                            "filename": filename,
                                            "path": str(filepath),
                                            "url": img_url,
                                            "width": image_data.get("width", self.width),
                                            "height": image_data.get("height", self.height),
                                            "content_type": image_data.get("content_type", "image/png"),
                                            "seed": result_data.get("seed", seed),
                                        })
                                    else:
                                        print(f"[fal.ai] Failed to download image from {img_url}: HTTP {response.status_code}")
                                except Exception as e:
                                    print(f"[fal.ai] Error downloading image from {img_url}: {str(e)}")
                            elif isinstance(image_data, str):
                                # Handle structure: {"images": ["data:image/..."]}
                                image_b64 = image_data
                                filename = self._save_image(image_b64, i)
                                results.append({
                                    "filename": filename,
                                    "path": str(self.output_dir / filename),
                                    "seed": result_data.get("seed", seed),
                                    "width": self.width,
                                    "height": self.height,
                                })
                            else:
                                print(f"[fal.ai] Unexpected image data format at index {i}: {type(image_data)}")
                                print(f"[fal.ai] Keys in image data: {list(image_data.keys()) if isinstance(image_data, dict) else 'N/A'}")
                    else:
                        print("[fal.ai] 'images' key exists but contains no elements")
                else:
                    print(f"[fal.ai] 'images' key exists but is not a list: {type(images_data)}")
            elif "image" in result_data:
                # Handle response format with just a single 'image' key
                image_b64 = result_data.get("image", "")
                if image_b64:
                    filename = self._save_image(image_b64, 0)
                    results.append({
                        "filename": filename,
                        "path": str(self.output_dir / filename),
                        "seed": result_data.get("seed", seed),
                        "width": self.width,
                        "height": self.height,
                    })
            else:
                # For other formats, print the keys to help debug
                print(f"[fal.ai] Warning: Unexpected response format. Keys: {list(result_data.keys())}")
                # Try to find any base64 image in the response
                for key, value in result_data.items():
                    if isinstance(value, str) and value.startswith("data:image") and ";base64," in value:
                        # Extract the base64 part
                        image_b64 = value.split(";base64,")[1]
                        filename = self._save_image(image_b64, 0, key)
                        results.append({
                            "filename": filename,
                            "path": str(self.output_dir / filename),
                            "key": key,
                            "width": self.width,
                            "height": self.height,
                        })
                
            if not results:
                print("[fal.ai] Warning: No images found in the API response")
                print(f"[fal.ai] Response keys: {list(result_data.keys())}")
                
                # Special handling for the 'images' key when debugging
                if "images" in result_data:
                    images_val = result_data["images"]
                    print(f"[fal.ai] Type of 'images' value: {type(images_val)}")
                    if isinstance(images_val, list):
                        print(f"[fal.ai] Number of items in 'images': {len(images_val)}")
                        if len(images_val) > 0:
                            first_item = images_val[0]
                            print(f"[fal.ai] Type of first item in 'images': {type(first_item)}")
                            if isinstance(first_item, dict):
                                print(f"[fal.ai] Keys in first item: {list(first_item.keys())}")
                
            return results
            
        except fal_client.auth.MissingCredentialsError:
            print("\033[91mError: FAL_KEY environment variable not found or is invalid.\033[0m")
            print("Visit https://app.fal.ai/settings/api-keys to get your API key.")
            raise
            
        except Exception as e:
            print(f"\033[91mError during image generation: {str(e)}\033[0m")
            raise

    async def _process_generation(self, handler) -> Dict[str, Any]:
        """Process the generation events and return the final result."""
        try:
            # 1. Display logs and progress during generation
            async for event in handler.iter_events(with_logs=True):
                if "logs" in event and event["logs"].strip():
                    print(f"[fal.ai] {event['logs'].strip()}")
        except TypeError as e:
            # If iter_events fails (e.g., when 'Completed' is not iterable)
            print(f"[fal.ai] Note: Progress streaming not available for this model")
        except Exception as e:
            print(f"[fal.ai] Warning: Could not stream progress logs: {str(e)}")
                
        # 2. Get the final result (this should still work regardless of streaming support)
        result = await handler.get()
        return result

    def _save_image(self, image_base64: str, index: int = 0, suffix: str = "") -> str:
        """Save a base64-encoded image to disk and return the filename."""
        try:
            # Generate a timestamped filename
            timestamp = int(time.time())
            if suffix:
                filename = f"image_{timestamp}_{index}_{suffix}.png"
            else:
                filename = f"image_{timestamp}_{index}.png"
            filepath = self.output_dir / filename
            
            # Handle different base64 formats
            if "," in image_base64 and ";base64," in image_base64:
                # Handle format like "data:image/png;base64,ABC123..."
                image_base64 = image_base64.split(";base64,")[1]
            
            # Decode and save the image
            try:
                image_data = base64.b64decode(image_base64)
                with open(filepath, "wb") as f:
                    f.write(image_data)
                
                print(f"[fal.ai] Saved image to {filepath}")
                return filename
            except Exception as e:
                print(f"[fal.ai] Error decoding image data: {str(e)}")
                # Save the raw response for debugging
                debug_file = self.output_dir / f"debug_response_{timestamp}.txt"
                with open(debug_file, "w") as f:
                    f.write(f"Error: {str(e)}\n\nBase64 data (first 100 chars):\n{image_base64[:100]}...")
                print(f"[fal.ai] Saved debug info to {debug_file}")
                return f"error_saving_{timestamp}.png"
        except Exception as e:
            print(f"[fal.ai] Error saving image: {str(e)}")
            return f"error_{int(time.time())}.png"


# ---------------------------------------------------------------------------
# CLI entry-point
# ---------------------------------------------------------------------------

def parse_args(argv: Optional[List[str]] = None) -> argparse.Namespace:
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(
        description="Generate images from text using fal.ai's Stable Diffusion API"
    )
    
    # Required arguments
    parser.add_argument(
        "--prompt", 
        default="A serene mountain lake at sunset with perfect reflections, golden hour lighting, snow-capped peaks, and a small wooden cabin on the shore. 8K, hyperrealistic, cinematic, professional photography.",
        help="Text description of the image to generate",
    )
    
    # Optional arguments
    parser.add_argument(
        "--model", 
        default="fal-ai/fast-sdxl",
        choices=ImageGenerator.AVAILABLE_MODELS.keys(),
        help="Which model to use for generation",
    )
    parser.add_argument(
        "--width", 
        type=int, 
        default=1024,
        help="Image width (multiple of 8, max 1024)",
    )
    parser.add_argument(
        "--height", 
        type=int, 
        default=1024,
        help="Image height (multiple of 8, max 1024)",
    )
    parser.add_argument(
        "--negative-prompt", 
        default="ugly, blurry, low quality, distorted, deformed",
        help="Elements to avoid in the generated image",
    )
    parser.add_argument(
        "--samples", 
        type=int, 
        default=1,
        help="Number of images to generate (max 4)",
    )
    parser.add_argument(
        "--steps", 
        type=int, 
        default=25,
        help="Number of inference steps (higher = better quality but slower)",
    )
    parser.add_argument(
        "--guidance", 
        type=float, 
        default=7.5,
        help="Guidance scale (higher = more faithful to prompt)",
    )
    parser.add_argument(
        "--scheduler",
        type=str,
        default=None,
        help="Diffusion scheduler to use (model-specific, leave empty for default)",
    )
    parser.add_argument(
        "--seed", 
        type=int, 
        default=None,
        help="Random seed for reproducibility",
    )
    parser.add_argument(
        "--output-dir", 
        default=None,
        help="Directory to save generated images",
    )
    
    args = parser.parse_args(argv)
    
    # Print available schedulers for the chosen model
    model = args.model
    print(f"Available schedulers for {model}:")
    for scheduler in ImageGenerator.MODEL_SCHEDULERS.get(model, []):
        print(f"  - {scheduler}")
    print(f"Default scheduler: {ImageGenerator.DEFAULT_SCHEDULERS.get(model, 'unknown')}")
    
    return args

async def main_async() -> None:
    """Async entry point for the image generator."""
    args = parse_args()
    
    generator = ImageGenerator(
        model=args.model,
        width=args.width,
        height=args.height,
        output_dir=args.output_dir,
    )
    
    try:
        # Generate the image(s)
        results = await generator.generate_image(
            prompt=args.prompt,
            negative_prompt=args.negative_prompt,
            num_samples=args.samples,
            scheduler=args.scheduler,
            num_inference_steps=args.steps,
            guidance_scale=args.guidance,
            seed=args.seed,
        )
        
        # Print result summary
        print("\n--- RESULT --------------------------------------------------------------")
        print(f"Generated {len(results)} image(s):")
        for i, result in enumerate(results):
            print(f"  {i+1}. {result['path']} (seed: {result['seed']})")
        print("-----------------------------------------------------------------------\n")
        
    except Exception as e:
        print(f"\033[91mError: {str(e)}\033[0m")
        sys.exit(1)

def main() -> None:
    """Synchronous entry point for the script."""
    asyncio.run(main_async())

if __name__ == "__main__":
    main()