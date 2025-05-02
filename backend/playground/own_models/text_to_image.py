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
