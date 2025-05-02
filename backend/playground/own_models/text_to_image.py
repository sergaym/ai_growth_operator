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
