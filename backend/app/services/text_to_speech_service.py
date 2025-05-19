"""
Text-to-Speech service integration for the AI Growth Operator.
This module provides interactions with the ElevenLabs API for speech generation.
"""

import os
import time
import uuid
import asyncio
import requests
import json
from pathlib import Path
from typing import Dict, List, Any, Optional, Union
from urllib.parse import urljoin

from dotenv import load_dotenv

# Import settings
from app.core.config import settings

# Import database components
from app.db import get_db, audio_repository
from app.db.blob_storage import upload_file, AssetType

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
        Get a list of all available voices from ElevenLabs.
        
        Returns:
            List of voice objects
        """
        try:
            # Use v2 API for better voice listing
            api_url = "https://api.elevenlabs.io/v2/voices"
            all_voices = []
            next_page_token = None
            page_size = 100  # Maximum page size allowed by ElevenLabs
            
            # Make paginated requests until we get all voices
            while True:
                # Prepare query parameters for pagination
                params = {
                    "page_size": page_size,
                    "include_total_count": True
                }
                
                # Add page token for subsequent requests
                if next_page_token:
                    params["next_page_token"] = next_page_token
                
                # Make the API request
                response = requests.get(
                    api_url, 
                    headers=self.headers,
                    params=params
                )
                response.raise_for_status()
                
                data = response.json()
                voices = data.get("voices", [])
                all_voices.extend(voices)
                
                # Check if there are more pages
                if not data.get("has_more", False):
                    break
                
                # Get the next page token for the next request
                next_page_token = data.get("next_page_token")
                if not next_page_token:
                    break
            
            # Process and enhance voice data
            enhanced_voices = []
            for voice in all_voices:
                enhanced_voice = {
                    "voice_id": voice.get("voice_id"),
                    "name": voice.get("name"),
                    "description": voice.get("description", ""),
                    "preview_url": voice.get("preview_url"),
                    "category": voice.get("category", ""),
                    "labels": {}
                }
                
                # Extract labels if available
                if "labels" in voice:
                    enhanced_voice["labels"] = voice["labels"]
                    
                    # Add specific properties for convenience
                    if "gender" in voice["labels"]:
                        enhanced_voice["gender"] = voice["labels"]["gender"]
                    
                    if "accent" in voice["labels"]:
                        enhanced_voice["accent"] = voice["labels"]["accent"]
                    
                    if "age" in voice["labels"]:
                        enhanced_voice["age"] = voice["labels"]["age"]
                
                # Extract languages if available
                if "verified_languages" in voice:
                    languages = []
                    for lang in voice.get("verified_languages", []):
                        if "language" in lang:
                            languages.append(lang["language"])
                    enhanced_voice["languages"] = languages
                
                # Add default settings if available
                if "settings" in voice:
                    enhanced_voice["default_settings"] = voice["settings"]
                
                enhanced_voices.append(enhanced_voice)
            
            return enhanced_voices
            
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
        save_to_file: bool = True,
        upload_to_blob: bool = False,
        user_id: Optional[str] = None,
        workspace_id: Optional[str] = None
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
            upload_to_blob: Whether to upload the audio to blob storage
            user_id: Optional user ID to associate with the audio
            workspace_id: Optional workspace ID to associate with the audio
            
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
        
        # Set default voice settings if not provided
        if not voice_settings:
            voice_settings = {
                "stability": 0.5,
                "similarity_boost": 0.75,
                "style": 0.0,
                "use_speaker_boost": True
            }
        
        # Prepare request data
        request_data = {
            "text": text,
            "model_id": model_id,
            "voice_settings": voice_settings
        }
        
        # Generate a unique ID for this request
        request_id = str(uuid.uuid4())
        timestamp = int(time.time())
        file_path = None
        blob_url = None
        
        try:
            # Set headers for audio response
            headers = self.headers.copy()
            headers["Accept"] = "audio/mpeg" if output_format == "mp3" else "audio/wav"
            
            # Generate a unique filename
            file_name = f"speech_{timestamp}_{request_id[:8]}.{output_format}"
            file_path = os.path.join(self.audio_dir, file_name)
            
            # Make the API request - use /stream endpoint for getting audio content
            tts_url = f"{self.api_url}text-to-speech/{voice_id}/stream"
            
            print(f"Generating speech with voice ID: {voice_id}")
            print(f"URL: {tts_url}")
            print(f"Text: {text[:100]}{'...' if len(text) > 100 else ''}")
            
            response = requests.post(
                tts_url,
                json=request_data,
                headers=headers,
                stream=True
            )
            response.raise_for_status()
            
            # Save to file if requested
            if save_to_file:
                with open(file_path, "wb") as f:
                    for chunk in response.iter_content(chunk_size=1024):
                        if chunk:
                            f.write(chunk)
                print(f"Speech generated and saved to: {file_path}")
                
                # Upload to blob storage if requested
                if upload_to_blob and settings.BLOB_READ_WRITE_TOKEN:
                    try:
                        with open(file_path, "rb") as audio_file:
                            # Read the file content
                            file_data = audio_file.read()
                            
                            # Only attempt to upload if we have data
                            if file_data:
                                # Map file extensions to correct MIME types
                                mime_type_map = {
                                    "mp3": "audio/mpeg",
                                    "wav": "audio/wav",
                                    "ogg": "audio/ogg"
                                }
                                
                                # Use the correct MIME type or default to the format-based one
                                content_type = mime_type_map.get(output_format, f"audio/{output_format}")
                                
                                blob_result = await upload_file(
                                    file_content=file_data,
                                    asset_type=AssetType.AUDIO,
                                    filename=file_name,
                                    content_type=content_type
                                )
                                
                                blob_url = blob_result.get("url")
                                if blob_url:
                                    print(f"Successfully uploaded audio to blob storage: {blob_url}")
                                    # Add blob URL to the response
                                    result["blob_url"] = blob_url
                            else:
                                print(f"Warning: Audio file is empty, skipping blob upload")
                    except Exception as e:
                        print(f"Error uploading to blob storage: {str(e)}")
                        # Continue execution even if blob upload fails (local file is still available)
                        # Log additional information to help debugging
                        import traceback
                        print(f"Blob upload error traceback: {traceback.format_exc()}")
            
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
            
            if blob_url:
                result["blob_url"] = blob_url
            
            # Save to database
            try:
                # Prepare data for database
                db_data = {
                    "text": text,
                    "voice_id": voice_id,
                    "voice_name": voice_name,
                    "model_id": model_id,
                    "language": language,
                    "status": "completed",
                    "audio_format": output_format,
                    "metadata_json": {
                        "voice_settings": voice_settings,
                        "timestamp": timestamp,
                        "request_id": request_id
                    }
                }
                
                # Add file paths if available
                if file_path:
                    db_data["file_path"] = file_path
                    db_data["local_url"] = f"file://{file_path}"
                
                if blob_url:
                    db_data["blob_url"] = blob_url
                
                # Add user and workspace IDs if provided
                if user_id:
                    db_data["user_id"] = user_id
                
                if workspace_id:
                    db_data["workspace_id"] = workspace_id
                
                # Get a database session and save the audio
                db = next(get_db())
                db_audio = audio_repository.create(db_data, db)
                
                if db_audio:
                    result["db_id"] = db_audio.id
            except Exception as e:
                print(f"Error saving to database: {str(e)}")
            
            return result
            
        except Exception as e:
            error_message = str(e)
            print(f"Error generating speech: {error_message}")
            
            # Check for more detailed error information
            if hasattr(e, 'response') and e.response is not None:
                try:
                    error_detail = e.response.json()
                    print(f"API Error: {json.dumps(error_detail, indent=2)}")
                    error_message = f"{error_message} - {error_detail.get('detail', '')}"
                except:
                    print(f"API Error Status Code: {e.response.status_code}")
                    print(f"API Error Text: {e.response.text}")
            
            error_result = {
                "status": "error",
                "error": error_message,
                "text": text,
                "voice_id": voice_id,
                "model_id": model_id,
                "timestamp": timestamp,
                "request_id": request_id
            }
            
            # Save error to database
            try:
                # Prepare error data for database
                error_db_data = {
                    "text": text,
                    "voice_id": voice_id,
                    "model_id": model_id,
                    "language": language,
                    "status": "failed",
                    "metadata_json": {
                        "error": error_message,
                        "voice_settings": voice_settings,
                        "timestamp": timestamp,
                        "request_id": request_id
                    }
                }
                
                # Add user and workspace IDs if provided
                if user_id:
                    error_db_data["user_id"] = user_id
                
                if workspace_id:
                    error_db_data["workspace_id"] = workspace_id
                
                # Get a database session and save the error
                db = next(get_db())
                db_audio = audio_repository.create(error_db_data, db)
                
                if db_audio:
                    error_result["db_id"] = db_audio.id
            except Exception as db_error:
                print(f"Error saving failed request to database: {str(db_error)}")
            
            return error_result


# Create a singleton instance of the service
text_to_speech_service = TextToSpeechService() 