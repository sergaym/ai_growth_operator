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

async def list_voices():
    """List all available voices from ElevenLabs with their details."""
    try:
        response = requests.get(f"{ELEVENLABS_BASE_URL}/voices", headers=headers)
        response.raise_for_status()
        voices = response.json()["voices"]
        
        print("\n=== Available Voices ===")
        for voice in voices:
            print(f"ID: {voice['voice_id']}")
            print(f"Name: {voice['name']}")
            print(f"Description: {voice.get('description', 'No description')}")
            print(f"Languages: {', '.join([lang.get('name', 'Unknown') for lang in voice.get('labels', {}).get('languages', [])])}")
            print("-" * 30)
        
        return voices
    except Exception as e:
        print(f"Error listing voices: {str(e)}")
        return []

async def generate_speech(
    text, 
    voice_id=None,
    voice_preset=None,
    stability=0.5,
    similarity_boost=0.75,
    style=0.0,
    use_speaker_boost=True,
    output_dir=None,
    filename=None
):
    """Generate speech from text using ElevenLabs API."""
    
    # Determine which voice ID to use
    if voice_preset and voice_preset in SPANISH_VOICES:
        voice_id = SPANISH_VOICES[voice_preset]
    elif not voice_id:
        # Default to the first Spanish voice if none specified
        voice_id = SPANISH_VOICES["male_1"]
    
    # Prepare the request data
    data = {
        "text": text,
        "model_id": "eleven_multilingual_v2",  # Using the multilingual model for better Spanish
        "voice_settings": {
            "stability": stability,
            "similarity_boost": similarity_boost,
            "style": style,
            "use_speaker_boost": use_speaker_boost
        }
    }
    
    print(f"Generating speech with voice ID: {voice_id}")
    print(f"Text: {text[:100]}{'...' if len(text) > 100 else ''}")
    
    try:
        # Make the API request
        response = requests.post(
            f"{ELEVENLABS_BASE_URL}/text-to-speech/{voice_id}/stream",
            json=data,
            headers=headers,
            stream=True
        )
        response.raise_for_status()
        
        # Create output directory if it doesn't exist
        if output_dir:
            output_path = Path(output_dir)
            output_path.mkdir(exist_ok=True, parents=True)
            
            # Generate filename if not provided
            if not filename:
                timestamp = int(time.time())
                voice_name = voice_preset or voice_id
                filename = f"speech_{voice_name}_{timestamp}.mp3"
            
            # Ensure filename has .mp3 extension
            if not filename.endswith(".mp3"):
                filename += ".mp3"
            
            filepath = output_path / filename
            
            # Save the audio file
            with open(filepath, "wb") as f:
                for chunk in response.iter_content(chunk_size=1024):
                    if chunk:
                        f.write(chunk)
            
            print(f"Speech generated and saved to: {filepath}")
            return str(filepath)
        else:
            print("No output directory specified, audio not saved.")
            return None
        
    except Exception as e:
        print(f"Error generating speech: {str(e)}")
        if hasattr(e, 'response') and e.response is not None:
            try:
                error_detail = e.response.json()
                print(f"API Error: {json.dumps(error_detail, indent=2)}")
            except:
                print(f"API Error Status Code: {e.response.status_code}")
                print(f"API Error Text: {e.response.text}")
        return None

async def list_spanish_voices():
    """List all Spanish voices from ElevenLabs."""
    try:
        voices = await list_voices()
        
        print("\n=== Spanish Voices ===")
        spanish_voices = []
        for voice in voices:
            languages = [
                lang.get('name', '').lower() 
                for lang in voice.get('labels', {}).get('languages', [])
            ]
            
            # Check if this voice supports Spanish
            if any('spanish' in lang or 'español' in lang for lang in languages):
                print(f"ID: {voice['voice_id']}")
                print(f"Name: {voice['name']}")
                print(f"Description: {voice.get('description', 'No description')}")
                print("-" * 30)
                spanish_voices.append(voice)
        
        if not spanish_voices:
            print("No Spanish voices found. Consider using a multilingual voice.")
        
        return spanish_voices
    except Exception as e:
        print(f"Error listing Spanish voices: {str(e)}")
        return []

def parse_args():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(description="Generate speech using ElevenLabs API with focus on Spanish voices")
    
    # Basic arguments
    parser.add_argument(
        "--text", 
        help="Text to convert to speech"
    )
    
    parser.add_argument(
        "--text-file",
        help="Path to a text file containing content to convert to speech"
    )
    
    parser.add_argument(
        "--output-dir",
        default="./output",
        help="Directory to save generated audio files"
    )
    
    parser.add_argument(
        "--filename",
        help="Filename for the output audio file (default: auto-generated)"
    )
    
    # Voice selection arguments
    parser.add_argument(
        "--voice-id",
        help="ElevenLabs voice ID to use"
    )
    
    parser.add_argument(
        "--voice-preset",
        choices=list(SPANISH_VOICES.keys()),
        help=f"Preset Spanish voice to use: {', '.join(SPANISH_VOICES.keys())}"
    )
    
    # Voice customization arguments
    parser.add_argument(
        "--stability",
        type=float,
        default=0.5,
        help="Voice stability (0.0-1.0): lower values are more expressive"
    )
    
    parser.add_argument(
        "--similarity-boost",
        type=float,
        default=0.75,
        help="Voice similarity boost (0.0-1.0): higher values preserve voice better"
    )
    
    parser.add_argument(
        "--style",
        type=float,
        default=0.0,
        help="Style emphasis (0.0-1.0): higher values emphasize style"
    )
    
    # Utility commands
    parser.add_argument(
        "--list-voices",
        action="store_true",
        help="List all available voices"
    )
    
    parser.add_argument(
        "--list-spanish-voices",
        action="store_true",
        help="List only Spanish voices"
    )
    
    return parser.parse_args()
