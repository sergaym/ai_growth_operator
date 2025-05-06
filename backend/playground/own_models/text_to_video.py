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
