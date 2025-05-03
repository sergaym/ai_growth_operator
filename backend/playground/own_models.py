# -*- coding: utf-8 -*-
"""backend.playground.own_models
===============================
A minimal yet production-grade example that **generates a short, hyper-realistic video ad** from a text prompt.

It demonstrates how to orchestrate OpenAI (for prompt refinement) together with our
`luma_service` wrapper to get a ready-to-share video in just a few lines.

Usage
-----
Run from the project root after setting `OPENAI_API_KEY` and `LUMAAI_API_KEY` env vars:

>>> python -m backend.playground.own_models \
        --prompt "Introducing AquaPure – the smart bottle that tracks your hydration in real-time" \
        --style cinematic \
        --duration "10 seconds"

This will:
1. Ask OpenAI to craft a vivid, camera-ready prompt.
2. Kick off a LumaAI generation.
3. Wait until the video is ready and print the URL (or download it locally).

Notes
-----
* For a more advanced pipeline (avatars, Heygen voice-over, etc.) extend the `VideoAdGenerator` class.
* Network calls are kept synchronous for brevity. For higher throughput consider wrapping them in background tasks or Celery/RQ workers.
"""
from __future__ import annotations

import argparse
import os
import sys
import time
from pathlib import Path
from typing import Dict, Any, Optional

from dotenv import load_dotenv
from openai import OpenAI

# Allow direct execution (`python -m backend.playground.own_models`) without PYTHONPATH issues
ROOT_DIR = Path(__file__).resolve().parents[2]
BACKEND_DIR = Path(__file__).resolve().parents[1]  # the 'backend' folder itself
for p in (ROOT_DIR, BACKEND_DIR):
    if str(p) not in sys.path:
        sys.path.append(str(p))

# Local imports after path adjustment
from app.services.luma_service import generate_video, wait_for_video_completion  # noqa: E402
from app.services.prompt_service import enhance_prompt  # noqa: E402
from app.core.config import settings  # noqa: E402

# ---------------------------------------------------------------------------
# Environment
# ---------------------------------------------------------------------------
load_dotenv()  # Load .env if present

# Validate keys early
if not (settings.OPENAI_API_KEY and (os.getenv("LUMAAI_API_KEY") or settings.LUMAAI_API_KEY)):
    raise EnvironmentError(
        "Both OPENAI_API_KEY and LUMAAI_API_KEY must be set as environment variables or in the .env file."
    )

# Initialize OpenAI client (streamlined vs. app-wide singleton)
openai_client = OpenAI(api_key=settings.OPENAI_API_KEY)


class VideoAdGenerator:
    """High-level orchestrator for generating a video ad from plain text."""

    def __init__(
        self,
        gpt_model: str = settings.DEFAULT_GPT_MODEL,
        luma_visual_style: Optional[str] = None,
        luma_duration: str = "10 seconds",
        luma_aspect_ratio: str = "16:9",
    ) -> None:
        self.gpt_model = gpt_model
        self.visual_style = luma_visual_style
        self.duration = luma_duration
        self.aspect_ratio = luma_aspect_ratio

    # ------------------------------------------------------------------
    # PUBLIC API
    # ------------------------------------------------------------------
    def create_video_ad(self, raw_prompt: str) -> Dict[str, Any]:
        """Generate a video ad and wait for its completion.

        Returns a dict containing `video_url` & friends.
        """
        refined_prompt = self._refine_prompt(raw_prompt)
        print(f"[Prompt] {refined_prompt}\n")

        # Kick off generation
        generation = generate_video(
            prompt=refined_prompt,
            visual_style=self.visual_style,
            duration=self.duration,
            aspect_ratio=self.aspect_ratio,
        )
        generation_id = generation["generation_id"]
        print(
            f"[LumaAI] Generation started (id={generation_id}). "
            f"Estimated completion: {generation['estimated_completion_time']}\n"
        )

        # Poll until ready (simple blocking call)
        result = wait_for_video_completion(generation_id, timeout=600)
        print("[LumaAI] Generation completed! ✅\n")
        return result

    # ------------------------------------------------------------------
    # INTERNAL HELPERS
    # ------------------------------------------------------------------
    def _refine_prompt(self, base_prompt: str) -> str:
        """Ask GPT to enrich the user prompt with cinematic detail."""
        system_msg = (
            "You are a world-class creative director. "
            "Turn product messaging into descriptive film prompts, focusing on hyper-realistic visuals, lighting, and emotion. "
            "Respond with a ONE-LINE prompt suitable for an AI video model."
        )
        user_msg = f"Product pitch: {base_prompt}"

        response = openai_client.chat.completions.create(
            model=self.gpt_model,
            messages=[
                {"role": "system", "content": system_msg},
                {"role": "user", "content": user_msg},
            ],
            temperature=0.7,
            max_tokens=120,
        )
        generated_prompt = response.choices[0].message.content.strip()

        # Pass through our prompt service to optionally add style metadata
        return enhance_prompt(generated_prompt, style=self.visual_style)


# ---------------------------------------------------------------------------
# CLI entry-point
# ---------------------------------------------------------------------------

def parse_args(argv: list[str] | None = None) -> argparse.Namespace:  # pragma: no cover
    parser = argparse.ArgumentParser(description="Generate a video ad from a text prompt via LumaAI.")
    parser.add_argument("--prompt", 
                       default="Introducing AquaPure – the smart bottle that tracks your hydration in real-time",
                       help="Base marketing prompt / product description")
    parser.add_argument("--style", default="cinematic", help="Visual style (see prompt_service templates)")
    parser.add_argument("--duration", default="10 seconds", help="Desired video duration, e.g. '10 seconds'")
    parser.add_argument("--aspect-ratio", default="16:9", help="Aspect ratio, e.g. '9:16' for portrait")
    parser.add_argument("--model", default=settings.DEFAULT_GPT_MODEL, help="OpenAI model to refine prompt")
    return parser.parse_args(argv)


def main() -> None:  # pragma: no cover
    args = parse_args()
    generator = VideoAdGenerator(
        gpt_model=args.model,
        luma_visual_style=args.style,
        luma_duration=args.duration,
        luma_aspect_ratio=args.aspect_ratio,
    )
    start = time.perf_counter()
    try:
        result = generator.create_video_ad(args.prompt)
        elapsed = time.perf_counter() - start

        print("\n--- RESULT --------------------------------------------------------------")
        
        # Check if the result contains video URL (the most important field)
        video_url = result.get("video_url")
        if video_url:
            print(f"Video URL       : {video_url}")
            print(f"Thumbnail URL   : {result.get('thumbnail_url')}")
            print(f"Duration        : {result.get('duration')}")
            print(f"Prompt used     : {result.get('prompt_used')}")
            print(f"Generation time : {elapsed:.1f}s")
        else:
            # Something went wrong, provide more detailed troubleshooting info
            print(f"ERROR: Video generation completed but no URL returned.")
            print(f"Generation ID   : {result.get('generation_id')}")
            print(f"Status          : {result.get('status')}")
            print(f"Error message   : {result.get('error') or result.get('message', 'Unknown error')}")
            print(f"Generation time : {elapsed:.1f}s")
            print("\nTROUBLESHOOTING:")
            print("1. Check your LumaAI account at https://lumalabs.ai/dashboard for the video")
            print("2. Verify you have sufficient credits in your LumaAI account")
            print("3. Try running with different parameters (shorter duration, different style)")
            print("4. Check your LUMAAI_API_KEY environment variable")
            
        print("-----------------------------------------------------------------------\n")
    except Exception as e:
        elapsed = time.perf_counter() - start
        print(f"\nERROR: Video generation failed after {elapsed:.1f}s")
        print(f"Error message: {str(e)}")
        print("\nPlease check your API keys and network connection.")


if __name__ == "__main__":  # pragma: no cover
    main()

# python playground/own_models.py --prompt "Your custom prompt here"