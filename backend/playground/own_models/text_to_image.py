# -*- coding: utf-8 -*-
"""backend.playground.own_models.text_to_image
================================================
Production-grade actor portrait generator using fal.ai's Stable Diffusion models.

Optimized for generating high-quality, photorealistic actor portraits for marketing materials
and UGC content. Combines best practices for prompt engineering and model parameters.

Usage
-----
Run from the project root after setting the FAL_KEY environment variable:

>>> python -m backend.playground.own_models.text_to_image --preset headshot

For custom generation with specific parameters:
>>> python -m backend.playground.own_models.text_to_image --prompt "Your detailed actor description" --quality high

The images will be saved to the output directory.
"""
from __future__ import annotations

import argparse
import asyncio
import base64
import os
import sys
import time
from enum import Enum
from pathlib import Path
from typing import Dict, Any, Optional, List, Union, Tuple

import fal_client
import requests
from dotenv import load_dotenv

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


class Quality(str, Enum):
    """Quality presets that determine generation parameters."""
    DRAFT = "draft"      # Fast, lower quality for testing
    STANDARD = "standard"  # Balanced quality and speed
    HIGH = "high"        # High quality, slower
    ULTRA = "ultra"      # Maximum quality, slowest


class ActorPreset(str, Enum):
    """Actor type presets with optimized prompts."""
    HEADSHOT = "headshot"    # Professional headshot
    CASUAL = "casual"        # Casual, friendly portrait
    CORPORATE = "corporate"  # Corporate/business setting
    DRAMATIC = "dramatic"    # Dramatic lighting/pose
    FRIENDLY = "friendly"    # Warm, approachable


class ImageGenerator:
    """Optimized portrait generator using fal.ai's Stable Diffusion API."""

    # Model mappings for different quality levels and portrait generation
    QUALITY_MODELS = {
        Quality.DRAFT: "fal-ai/stable-diffusion-xl-turbo",  # Fastest
        Quality.STANDARD: "fal-ai/fast-sdxl",               # Good balance
        Quality.HIGH: "fal-ai/realistic-vision-v5",         # Better realism
        Quality.ULTRA: "fal-ai/stable-diffusion-v35-large", # Highest quality
    }
    
    # Parameter settings for each quality level
    QUALITY_SETTINGS = {
        Quality.DRAFT: {
            "steps": 15,
            "guidance": 7.0,
        },
        Quality.STANDARD: {
            "steps": 25,
            "guidance": 7.5,
        },
        Quality.HIGH: {
            "steps": 35,
            "guidance": 8.5,
        },
        Quality.ULTRA: {
            "steps": 50,
            "guidance": 9.0,
        }
    }
    
    # Best scheduler for each model
    MODEL_SCHEDULERS = {
        "fal-ai/fast-sdxl": "Euler A",
        "fal-ai/stable-diffusion-v35-large": "K_EULER_ANCESTRAL",
        "fal-ai/realistic-vision-v5": "K_EULER_ANCESTRAL",
        "fal-ai/stable-diffusion-xl-turbo": "Euler A",
    }
    
    # Base prompts for different actor presets
    PRESET_PROMPTS = {
        ActorPreset.HEADSHOT: (
            "Professional headshot of a {gender}, age {age}, with a confident expression. "
            "Studio lighting with soft key light, crisp focus, neutral background. "
            "Subject is wearing professional attire, looking directly at camera. "
            "Hyperrealistic, 8K, professional photography, perfect for business profiles."
        ),
        ActorPreset.CASUAL: (
            "Casual portrait of a {gender}, age {age}, with a relaxed, friendly expression. "
            "Natural outdoor lighting, shallow depth of field. Subject is wearing casual clothing. "
            "Hyperrealistic, cinematic, professional photography, authentic lifestyle shot."
        ),
        ActorPreset.CORPORATE: (
            "Corporate portrait of a {gender}, age {age}, in a modern office environment. "
            "Professional attire, confident posture, approachable expression. "
            "Soft office lighting, slightly blurred office background. "
            "Hyperrealistic, 8K, professional photography, perfect for marketing materials."
        ),
        ActorPreset.DRAMATIC: (
            "Dramatic portrait of a {gender}, age {age}, with striking lighting. "
            "Strong contrast, defined shadows, intense expression. "
            "Dark or minimalist background, professional styling. "
            "Hyperrealistic, cinematic quality, editorial photography style."
        ),
        ActorPreset.FRIENDLY: (
            "Warm, friendly portrait of a {gender}, age {age}, with a genuine smile. "
            "Soft, flattering lighting, vibrant but natural colors. "
            "Clean, simple background, casual-professional attire. "
            "Hyperrealistic, 8K, approachable, perfect for customer-facing content."
        ),
    }
    
    # Negative prompts for actor portraits
    ACTOR_NEGATIVE_PROMPT = (
        "deformed, distorted, disfigured, poorly drawn, bad anatomy, wrong anatomy, "
        "extra limb, missing limb, floating limbs, disconnected limbs, mutation, mutated, "
        "ugly, disgusting, cartoon, anime, painting, drawing, sketch, disproportionate, blurry, "
        "low-res, CGI, 3d, render, overexposed, underexposed, oversaturated"
    )

    def __init__(
        self,
        quality: Quality = Quality.STANDARD,
        output_dir: Optional[str] = None,
        width: int = 1024,
        height: int = 1024,
    ):
        """Initialize the image generator with quality settings.

        Args:
            quality: Quality preset (determines model and parameters)
            output_dir: Directory to save images (default: ./output)
            width: Image width (default: 1024)
            height: Image height (default: 1024)
        """
        self.quality = quality
        self.model = self.QUALITY_MODELS[quality]
        self.settings = self.QUALITY_SETTINGS[quality]
        
        # Ensure dimensions are valid
        self.width = self._validate_dimension(width, "width")
        self.height = self._validate_dimension(height, "height")
        
        # Set up output directory
        if output_dir:
            self.output_dir = Path(output_dir)
        else:
            self.output_dir = Path(__file__).parent / "output"
        self.output_dir.mkdir(exist_ok=True, parents=True)
        
        print(f"Initialized generator with quality '{quality}', using model '{self.model}'")
        print(f"Steps: {self.settings['steps']}, Guidance: {self.settings['guidance']}")

    @staticmethod
    def _validate_dimension(value: int, dim_name: str) -> int:
        """Ensure dimensions are multiples of 8 and within bounds."""
        if value % 8 != 0:
            value = value - value % 8
        
        if value < 512:
            value = 512
        
        if value > 1024:
            value = 1024
            
        return value
        
    def format_actor_prompt(
        self, 
        prompt: str, 
        preset: Optional[ActorPreset] = None,
        gender: str = "person",
        age: str = "25-35",
    ) -> str:
        """Format a prompt using preset templates or return custom prompt.
        
        Args:
            prompt: Custom prompt or None to use preset
            preset: Actor preset type
            gender: Gender for preset templates
            age: Age range for preset templates
            
        Returns:
            Formatted prompt
        """
        if preset and not prompt:
            # Use preset template
            template = self.PRESET_PROMPTS.get(preset)
            if template:
                return template.format(gender=gender, age=age)
                
        # Custom prompt or fallback
        return prompt

    async def generate_actor_portrait(
        self, 
        prompt: str,
        preset: Optional[ActorPreset] = None,
        gender: str = "person",
        age_range: str = "25-35",
        num_samples: int = 1,
        seed: Optional[int] = None,
    ) -> List[Dict[str, Any]]:
        """Generate realistic actor portraits.

        Args:
            prompt: Custom prompt (or None to use preset)
            preset: Actor type preset
            gender: Gender description for preset templates
            age_range: Age range for preset templates
            num_samples: Number of images to generate
            seed: Random seed for reproducibility

        Returns:
            List of dicts containing image data and metadata
        """
        # Format the prompt based on preset if needed
        formatted_prompt = self.format_actor_prompt(
            prompt=prompt, 
            preset=preset,
            gender=gender,
            age=age_range,
        )
        
        # Quality-specific settings
        steps = self.settings["steps"]  
        guidance = self.settings["guidance"]
        scheduler = self.MODEL_SCHEDULERS.get(self.model, "Euler A")
        
        print(f"\n[fal.ai] Generating {num_samples} actor portrait(s) with '{self.model}'")
        print(f"[fal.ai] Prompt: {formatted_prompt}")
        print(f"[fal.ai] Quality settings: {steps} steps, {guidance} guidance")
        
        start_time = time.time()
        
        # Prepare the arguments based on the model
        arguments = {
            "prompt": formatted_prompt,
            "negative_prompt": self.ACTOR_NEGATIVE_PROMPT,
            "width": self.width,
            "height": self.height,
            "num_images": min(num_samples, 4),  # API limit
            "scheduler": scheduler,
            "guidance_scale": guidance,
            "num_inference_steps": steps,
        }
        
        if seed is not None:
            arguments["seed"] = seed

        try:
            # Submit the generation request
            handler = await fal_client.submit_async(
                self.model,
                arguments=arguments,
            )

            # Process the result
            result_data = await self._process_generation(handler)
            
            elapsed = time.time() - start_time
            print(f"[fal.ai] Generation completed in {elapsed:.2f}s ✅")
            
            # Save the full response for debugging
            debug_file = self.output_dir / f"debug_response_{int(time.time())}.json"
            with open(debug_file, "w") as f:
                import json
                json.dump(result_data, f, indent=2)
            
            # Extract and save images
            results = await self._extract_images(result_data, seed)
            
            if results:
                print(f"[fal.ai] Successfully generated {len(results)} actor portrait(s)")
            else:
                print("[fal.ai] No images could be extracted from the response")
                
            return results
            
        except Exception as e:
            print(f"\033[91mError during image generation: {str(e)}\033[0m")
            raise

    async def _process_generation(self, handler) -> Dict[str, Any]:
        """Process the generation events and return the final result."""
        try:
            # Try to display logs and progress during generation
            async for event in handler.iter_events(with_logs=True):
                if "logs" in event and event["logs"].strip():
                    print(f"[fal.ai] {event['logs'].strip()}")
        except Exception:
            # Some models don't support streaming logs
            print(f"[fal.ai] Note: Progress streaming not available for this model")
                
        # Get the final result (always works regardless of streaming support)
        result = await handler.get()
        return result
        
    async def _extract_images(self, result_data: Dict[str, Any], seed: Optional[int]) -> List[Dict[str, Any]]:
        """Extract and save images from any supported response format."""
        results = []
        
        # Try different response formats
        if "images" in result_data:
            images_data = result_data.get("images", [])
            if isinstance(images_data, list):
                for i, image_data in enumerate(images_data):
                    # Different models use different formats
                    if isinstance(image_data, dict):
                        # Format 1: Image in dict
                        if "image" in image_data:
                            image_b64 = image_data.get("image", "")
                            if image_b64:
                                result = await self._save_base64_image(
                                    image_b64, i, result_data.get("seed", seed)
                                )
                                if result:
                                    results.append(result)
                                    
                        # Format 2: URL in dict
                        elif "url" in image_data or "file_path" in image_data:
                            img_url = image_data.get("url") or image_data.get("file_path")
                            if img_url:
                                result = await self._save_image_from_url(
                                    img_url, i, result_data.get("seed", seed),
                                    width=image_data.get("width", self.width),
                                    height=image_data.get("height", self.height),
                                )
                                if result:
                                    results.append(result)
                    
                    # Format 3: Direct string
                    elif isinstance(image_data, str):
                        result = await self._save_base64_image(
                            image_data, i, result_data.get("seed", seed)
                        )
                        if result:
                            results.append(result)
        
        # Format 4: Direct image
        elif "image" in result_data:
            image_b64 = result_data.get("image", "")
            if image_b64:
                result = await self._save_base64_image(
                    image_b64, 0, result_data.get("seed", seed)
                )
                if result:
                    results.append(result)
                    
        # Debug info if no images found
        if not results:
            print(f"[fal.ai] Response keys: {list(result_data.keys())}")
            if "images" in result_data:
                images_val = result_data["images"]
                print(f"[fal.ai] Type of 'images': {type(images_val)}")
                if isinstance(images_val, list) and len(images_val) > 0:
                    print(f"[fal.ai] First item type: {type(images_val[0])}")
                    if isinstance(images_val[0], dict):
                        print(f"[fal.ai] First item keys: {list(images_val[0].keys())}")
                        
        return results
    
    async def _save_base64_image(
        self, 
        image_base64: str, 
        index: int, 
        seed: Optional[int]
    ) -> Optional[Dict[str, Any]]:
        """Save a base64-encoded image to disk."""
        try:
            # Handle different base64 formats
            if "," in image_base64 and ";base64," in image_base64:
                image_base64 = image_base64.split(";base64,")[1]
            
            # Decode and save the image
            image_data = base64.b64decode(image_base64)
            timestamp = int(time.time())
            filename = f"actor_{timestamp}_{index}.png"
            filepath = self.output_dir / filename
            
            with open(filepath, "wb") as f:
                f.write(image_data)
            
            print(f"[fal.ai] Saved actor portrait to {filepath}")
            return {
                "filename": filename,
                "path": str(filepath),
                "seed": seed,
                "width": self.width,
                "height": self.height,
                "quality": self.quality,
            }
        except Exception as e:
            print(f"[fal.ai] Error saving image: {str(e)}")
            return None
            
    async def _save_image_from_url(
        self, 
        url: str, 
        index: int,
        seed: Optional[int],
        width: Optional[int] = None,
        height: Optional[int] = None,
    ) -> Optional[Dict[str, Any]]:
        """Download and save an image from a URL."""
        try:
            print(f"[fal.ai] Downloading actor portrait from URL: {url}")
            response = requests.get(url)
            if response.status_code == 200:
                timestamp = int(time.time())
                filename = f"actor_{timestamp}_{index}.png"
                filepath = self.output_dir / filename
                
                with open(filepath, "wb") as f:
                    f.write(response.content)
                
                print(f"[fal.ai] Saved actor portrait to {filepath}")
                return {
                    "filename": filename,
                    "path": str(filepath),
                    "url": url,
                    "seed": seed,
                    "width": width or self.width,
                    "height": height or self.height,
                    "quality": self.quality,
                }
            else:
                print(f"[fal.ai] Failed to download image: HTTP {response.status_code}")
                return None
        except Exception as e:
            print(f"[fal.ai] Error downloading image: {str(e)}")
            return None


# ---------------------------------------------------------------------------
# CLI interface
# ---------------------------------------------------------------------------

def parse_args(argv: Optional[List[str]] = None) -> argparse.Namespace:
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(
        description="Generate high-quality actor portraits for UGC content"
    )
    
    parser.add_argument(
        "--preset",
        type=str,
        choices=[p.value for p in ActorPreset],
        help="Actor type preset (headshot, casual, corporate, dramatic, friendly)",
    )
    
    parser.add_argument(
        "--prompt", 
        default="Create a hyperrealistic 4K actor of a charismatic 25-35 year-old person (gender-neutral or [specify gender if needed]) with a natural, approachable expression. The actor should have clear skin, subtle makeup (if any), and modern casual clothing (like a neutral-toned T-shirt or hoodie). Lighting should be soft and natural, emulating indoor daylight. Background should be minimal or softly blurred, keeping full focus on the face. The avatar must look camera-ready for direct-to-camera speaking in UGC content—authentic, warm, and trustworthy. Include micro-details like skin texture, eye reflection, and natural hair flow.",
        help="Custom prompt for the actor portrait",
    )
    
    parser.add_argument(
        "--quality", 
        type=str,
        default="standard",
        choices=[q.value for q in Quality],
        help="Quality preset: draft (fast), standard, high, ultra (slowest)",
    )
    
    parser.add_argument(
        "--gender",
        type=str,
        default="person",
        help="Gender description for the actor (used with presets)"
    )
    
    parser.add_argument(
        "--age",
        type=str,
        default="25-35",
        help="Age range for the actor (used with presets)"
    )
    
    parser.add_argument(
        "--samples", 
        type=int, 
        default=1,
        help="Number of variations to generate (max 4)",
    )
    
    parser.add_argument(
        "--seed", 
        type=int, 
        default=None,
        help="Random seed for reproducibility",
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
        "--output-dir", 
        default=None,
        help="Directory to save generated portraits",
    )
    
    return parser.parse_args(argv)

async def main_async() -> None:
    """Async entry point for the image generator."""
    args = parse_args()
    
    # Convert string args to enums
    quality = Quality(args.quality)
    preset = ActorPreset(args.preset) if args.preset else None
    
    # Create generator with quality settings
    generator = ImageGenerator(
        quality=quality,
        output_dir=args.output_dir,
        width=args.width,
        height=args.height,
    )
    
    try:
        # Generate actor portrait(s)
        results = await generator.generate_actor_portrait(
            prompt=args.prompt,
            preset=preset,
            gender=args.gender,
            age_range=args.age,
            num_samples=args.samples,
            seed=args.seed,
        )
        
        # Print result summary
        print("\n--- ACTOR PORTRAITS GENERATED ---------------------------------------")
        print(f"Generated {len(results)} portrait(s):")
        for i, result in enumerate(results):
            print(f"  {i+1}. {result['path']}")
            if 'seed' in result and result['seed']:
                print(f"     Seed: {result['seed']} (use this seed to recreate this exact image)")
        print("--------------------------------------------------------------------\n")
        
    except Exception as e:
        print(f"\033[91mError: {str(e)}\033[0m")
        sys.exit(1)

def main() -> None:
    """Synchronous entry point for the script."""
    asyncio.run(main_async())

if __name__ == "__main__":
    main()