#!/usr/bin/env python
"""
Text to Lipsync Video Pipeline

This script combines multiple AI models to create a talking video from:
1. Text (converted to speech)
2. Image (converted to video)
3. The generated speech is synced with the video using lipsync

It's a complete pipeline for creating lip-synced talking avatars.
"""

import argparse
import asyncio
import os
import tempfile
import time
from pathlib import Path

import requests
from dotenv import load_dotenv

# Import our custom modules
from image_to_video import submit as generate_video
from lipsync import submit as apply_lipsync
from text_image import submit as generate_image

