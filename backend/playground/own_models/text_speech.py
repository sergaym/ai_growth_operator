import argparse
import asyncio
import os
import sys
import time
from pathlib import Path
import json
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Check for ElevenLabs API key
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
if not ELEVENLABS_API_KEY:
    print("Error: No ElevenLabs API key found. Please set ELEVENLABS_API_KEY environment variable.")
    print("Get your API key from: https://elevenlabs.io/app/account/api-key")
    sys.exit(1)

# Define base URLs and headers
ELEVENLABS_BASE_URL = "https://api.elevenlabs.io/v1"
headers = {
    "xi-api-key": ELEVENLABS_API_KEY,
    "Content-Type": "application/json"
}

# Spanish voice presets - these IDs are examples and may need to be updated
# with actual Spanish voice IDs from ElevenLabs
SPANISH_VOICES = {
    "male_1": "pNInz6obpgDQGcFmaJgB",  # Example ID for Spanish male voice
    "female_1": "jBpfuIE2acCO8z3wKNLl",  # Example ID for Spanish female voice
    "male_2": "XrExE9yKIg1WjnnlVkGX",   # Example ID for another Spanish male voice
    "female_2": "zcAOhNBS3c14rBihAFp2", # Example ID for another Spanish female voice
}

