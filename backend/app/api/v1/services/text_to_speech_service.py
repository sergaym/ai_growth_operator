"""
Text-to-Speech service integration for the AI Growth Operator.
This module provides interactions with the ElevenLabs API for speech generation.
"""

import os
import time
import uuid
import asyncio
import requests
from pathlib import Path
from typing import Dict, List, Any, Optional, Union
from urllib.parse import urljoin

from dotenv import load_dotenv

# Import settings
from app.core.config import settings

# Load environment variables
load_dotenv()

# Constants
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY") or settings.ELEVENLABS_API_KEY
ELEVENLABS_API_URL = "https://api.elevenlabs.io/v1/"

# Voice presets for different languages
VOICE_PRESETS = {
    "english": {
        "male_1": "ErXwobaYiN019PkySvjV", # Antoni
        "male_2": "VR6AewLTigWG4xSOukaG", # Arnold
        "male_3": "pNInz6obpgDQGcFmaJgB", # Adam
        "female_1": "EXAVITQu4vr4xnSDxMaL", # Bella
        "female_2": "21m00Tcm4TlvDq8ikWAM", # Rachel
        "female_3": "AZnzlk1XvdvUeBnXmlld", # Domi
        "neutral_1": "ThT5KcBeYPX3keUQqHPh", # Kai
    },
    "spanish": {
        "male_1": "TxGEqnHWrfWFTfGW9XjX", # Pedro
        "female_1": "t0jbNlBVZ17f02VDIeMI", # Mia
    },
    "french": {
        "male_1": "Yko7PKHZNXotIFUBG7I9", # Jean
        "female_1": "jsCqWAovK2LkecY7zXl4", # Chloé
    },
    "german": {
        "male_1": "wViXBPUzp2ZZixB1xQuM", # Markus
        "female_1": "SyKcnGXLJQxrLxBsIOHb", # Greta
    },
    "italian": {
        "male_1": "MF3mGyEYCl7XYWbV9V6O", # Luca
        "female_1": "XB0fDUnXU5powFXDhCwa", # Isabella
    },
    "portuguese": {
        "male_1": "TuoYUnLw6TrfyLqCqG8N", # Paulo 
        "female_1": "98KXN89mtC8gJCLqQOdJ", # Catarina
    },
    "japanese": {
        "male_1": "zcAOhNBS3c14rBihAFp1", # Haru
        "female_1": "8OhHJP1g1e7Ub0GFMHpY", # Akiko
    },
    "korean": {
        "male_1": "CYw3kZ02Hs0563khs1Fj", # Min-Jun
        "female_1": "z9fAnlkpzviPz146aGWa", # Seo-Yun
    }
}

class TextToSpeechService:
    """Service for generating speech from text using ElevenLabs"""
    
    def __init__(self):
        """Initialize the TextToSpeechService with API credentials"""
        self.api_key = ELEVENLABS_API_KEY
        if not self.api_key:
            raise ValueError("ElevenLabs API key not found. Please set ELEVENLABS_API_KEY in your environment.")
        
        self.api_url = ELEVENLABS_API_URL
        self.headers = {
            "Accept": "application/json",
            "xi-api-key": self.api_key,
        }
        
        # Create audio directory if it doesn't exist
        self.audio_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))), "output", "audio")
        os.makedirs(self.audio_dir, exist_ok=True)
    
    async def list_voices(self) -> List[Dict[str, Any]]:
        """
        Get a list of available voices from ElevenLabs.
        
        Returns:
            List of voice objects
        """
        try:
            response = requests.get(urljoin(self.api_url, "voices"), headers=self.headers)
            response.raise_for_status()
            
            data = response.json()
            voices = data.get("voices", [])
            
            # Enhance the response with additional metadata
            for voice in voices:
                # Add language info if available
                if "labels" in voice and voice["labels"]:
                    language = voice["labels"].get("language")
                    if language:
                        voice["languages"] = [language]
                    
                    # Add gender info if available
                    gender = voice["labels"].get("gender")
                    if gender:
                        voice["gender"] = gender
                    
                    # Add age info if available
                    age = voice["labels"].get("age")
                    if age:
                        voice["age"] = age
                    
                    # Add accent info if available
                    accent = voice["labels"].get("accent")
                    if accent:
                        voice["accent"] = accent
                
                # Add preview URL if available
                if "preview_url" in voice:
                    voice["preview_url"] = voice["preview_url"]
                
                # Add description if available
                if "description" in voice:
                    voice["description"] = voice["description"]
            
            return voices
            
        except Exception as e:
            print(f"Error getting voices: {str(e)}")
            return []
    
    def get_voice_preset(self, preset: str, language: str = "english") -> Optional[str]:
        """
        Get a voice ID based on a preset name and language.
        
        Args:
            preset: Preset name (e.g., 'male_1', 'female_2')
            language: Language for the voice (e.g., 'english', 'spanish')
            
        Returns:
            Voice ID if found, None otherwise
        """
        language = language.lower()
        if language not in VOICE_PRESETS:
            return None
        
        return VOICE_PRESETS[language].get(preset)
    
    async def generate_speech(
        self,
        text: str,
        voice_id: Optional[str] = None,
        voice_preset: Optional[str] = None,
        language: str = "english",
        model_id: str = "eleven_multilingual_v2",
        voice_settings: Optional[Dict[str, Any]] = None,
        output_format: str = "mp3",
        save_to_file: bool = True
    ) -> Dict[str, Any]:
        """
        Generate speech from text using ElevenLabs API.
        
        Args:
            text: Text to convert to speech
            voice_id: ElevenLabs voice ID
            voice_preset: Preset voice to use (e.g., 'male_1', 'female_1')
            language: Language for the speech
            model_id: ElevenLabs model ID
            voice_settings: Custom voice settings
            output_format: Audio format to output
            save_to_file: Whether to save the audio to a file
            
        Returns:
            Dictionary with response data
        """
        # Get voice ID from preset if not provided directly
        if not voice_id and voice_preset:
            voice_id = self.get_voice_preset(voice_preset, language)
        
        # Use default voice if neither voice_id nor voice_preset is provided
        if not voice_id:
            voice_id = VOICE_PRESETS.get(language.lower(), {}).get("male_1")
            if not voice_id:
                # Fallback to English male_1 if no voice for the language
                voice_id = VOICE_PRESETS["english"]["male_1"]
        
        # Prepare request data
        request_data = {
            "text": text,
            "model_id": model_id,
        }
        
        # Add voice settings if provided
        if voice_settings:
            request_data["voice_settings"] = voice_settings
        
        try:
            # Set headers for audio response
            headers = self.headers.copy()
            headers["Accept"] = "audio/mpeg" if output_format == "mp3" else "audio/wav"
            
            # Generate a unique filename
            timestamp = int(time.time())
            request_id = str(uuid.uuid4())
            file_name = f"speech_{timestamp}_{request_id[:8]}.{output_format}"
            file_path = os.path.join(self.audio_dir, file_name)
            
            # Make the API request
            tts_url = urljoin(self.api_url, f"text-to-speech/{voice_id}")
            response = requests.post(tts_url, json=request_data, headers=headers)
            response.raise_for_status()
            
            # Save to file if requested
            if save_to_file:
                with open(file_path, "wb") as f:
                    f.write(response.content)
            
            # Get voice name for the response
            voice_name = None
            try:
                voice_response = requests.get(
                    urljoin(self.api_url, f"voices/{voice_id}"), 
                    headers=self.headers
                )
                if voice_response.status_code == 200:
                    voice_data = voice_response.json()
                    voice_name = voice_data.get("name")
            except:
                pass
                
            # Create response
            result = {
                "audio_url": f"file://{file_path}" if save_to_file else None,
                "text": text,
                "voice_id": voice_id,
                "voice_name": voice_name,
                "model_id": model_id,
                "status": "success",
                "timestamp": timestamp,
                "request_id": request_id
            }
            
            return result
            
        except Exception as e:
            error_message = str(e)
            print(f"Error generating speech: {error_message}")
            
            return {
                "status": "error",
                "error": error_message,
                "text": text,
                "voice_id": voice_id,
                "model_id": model_id
            }


# Create a singleton instance of the service
text_to_speech_service = TextToSpeechService() 