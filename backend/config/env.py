import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Luma AI configuration
LUMAAI_API_KEY = os.getenv("LUMAAI_API_KEY")

# Video generation settings
DEFAULT_VIDEO_DURATION = "5s"  # Default duration for generated videos
DEFAULT_RESOLUTION = "720p"  # Options: 540p, 720p, 1080p, 4k
DEFAULT_MODEL = "ray-2"  # Luma AI's latest model
ENABLE_LOOP = False  # Whether to loop videos by default

# Path configurations
VIDEO_OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "output", "videos")

# Ensure output directories exist
os.makedirs(VIDEO_OUTPUT_DIR, exist_ok=True) 