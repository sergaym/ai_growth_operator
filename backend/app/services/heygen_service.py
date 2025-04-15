"""
Heygen API service for creating avatar videos
"""

import os
import requests
import time
import logging
from typing import Dict, Any, List, Optional

# Configure logging
logger = logging.getLogger(__name__)

class HeygenService:
    """Service for interacting with the Heygen API to create avatar videos."""
    
    def __init__(self):
        """Initialize the Heygen API service with API key from environment."""
        self.api_key = os.environ.get("HEYGEN_API_KEY")
        if not self.api_key:
            raise ValueError("HEYGEN_API_KEY environment variable is required")
        
        self.base_url = "https://api.heygen.com"
        self.headers = {
            "X-Api-Key": self.api_key,
            "Content-Type": "application/json"
        }
    
    def list_avatars(self) -> List[Dict[str, Any]]:
        """Get a list of available avatars from Heygen API."""
        url = f"{self.base_url}/v2/avatars"
        
        try:
            response = requests.get(url, headers=self.headers)
            response.raise_for_status()
            data = response.json()
            return data.get("data", {}).get("avatars", [])
        except requests.RequestException as e:
            logger.error(f"Error listing avatars: {str(e)}")
            raise Exception(f"Failed to list avatars: {str(e)}")
    
    def list_voices(self) -> List[Dict[str, Any]]:
        """Get a list of available voices from Heygen API."""
        url = f"{self.base_url}/v2/voices"
        
        try:
            response = requests.get(url, headers=self.headers)
            response.raise_for_status()
            data = response.json()
            return data.get("data", {}).get("voices", [])
        except requests.RequestException as e:
            logger.error(f"Error listing voices: {str(e)}")
            raise Exception(f"Failed to list voices: {str(e)}")
    
    def generate_avatar_video(
        self,
        prompt: str,
        avatar_id: str,
        voice_id: str,
        background_color: str = "#f6f6fc",
        width: int = 1280,
        height: int = 720,
        voice_speed: float = 1.0,
        voice_pitch: int = 0,
        avatar_style: str = "normal",
        callback_url: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generate an avatar video using the Heygen API.
        
        Args:
            prompt: The text for the avatar to speak
            avatar_id: The ID of the avatar to use
            voice_id: The ID of the voice to use
            background_color: Background color in hex format (default: "#f6f6fc")
            width: Video width in pixels (default: 1280)
            height: Video height in pixels (default: 720)
            voice_speed: Voice speed, between 0.5 and 1.5 (default: 1.0)
            voice_pitch: Voice pitch, between -50 and 50 (default: 0)
            avatar_style: Avatar style, one of "normal", "circle", "closeUp" (default: "normal")
            callback_url: Optional URL for callbacks when video is complete
        
        Returns:
            Dict containing the video ID and status
        """
        url = f"{self.base_url}/v2/video/generate"
        
        payload = {
            "video_inputs": [
                {
                    "character": {
                        "type": "avatar",
                        "avatar_id": avatar_id,
                        "avatar_style": avatar_style
                    },
                    "voice": {
                        "type": "text",
                        "input_text": prompt,
                        "voice_id": voice_id,
                        "speed": voice_speed,
                        "pitch": voice_pitch
                    },
                    "background": {
                        "type": "color",
                        "value": background_color
                    }
                }
            ],
            "dimension": {
                "width": width,
                "height": height
            }
        }
        
        if callback_url:
            payload["callback_url"] = callback_url
        
        try:
            response = requests.post(url, headers=self.headers, json=payload)
            response.raise_for_status()
            data = response.json()
            
            if data.get("error"):
                logger.error(f"Heygen API error: {data.get('error')}")
                raise Exception(f"Heygen API error: {data.get('error')}")
                
            return {
                "video_id": data.get("data", {}).get("video_id"),
                "status": "pending"
            }
        except requests.RequestException as e:
            logger.error(f"Error generating avatar video: {str(e)}")
            raise Exception(f"Failed to generate avatar video: {str(e)}")
    
    def check_video_status(self, video_id: str) -> Dict[str, Any]:
        """
        Check the status of a video generation.
        
        Args:
            video_id: The ID of the video to check
            
        Returns:
            Dict containing the status and video URL (if complete)
        """
        url = f"{self.base_url}/v1/video_status.get"
        params = {"video_id": video_id}
        
        try:
            response = requests.get(url, headers=self.headers, params=params)
            response.raise_for_status()
            data = response.json()
            
            if data.get("code") != 100:
                logger.error(f"Heygen API error: {data.get('message')}")
                raise Exception(f"Heygen API error: {data.get('message')}")
            
            result = {
                "video_id": video_id,
                "status": data.get("data", {}).get("status", "unknown")
            }
            
            # Add additional fields if video is completed
            if result["status"] == "completed":
                result.update({
                    "video_url": data.get("data", {}).get("video_url"),
                    "thumbnail_url": data.get("data", {}).get("thumbnail_url"),
                    "duration": data.get("data", {}).get("duration")
                })
            # Add error details if video failed
            elif result["status"] == "failed":
                error_data = data.get("data", {}).get("error", {})
                result["error"] = {
                    "code": error_data.get("code"),
                    "message": error_data.get("message"),
                    "detail": error_data.get("detail")
                }
            
            return result
        except requests.RequestException as e:
            logger.error(f"Error checking video status: {str(e)}")
            raise Exception(f"Failed to check video status: {str(e)}")
    
    def wait_for_video_completion(self, video_id: str, timeout: int = 300, interval: int = 5) -> Dict[str, Any]:
        """
        Wait for a video to complete processing.
        
        Args:
            video_id: The ID of the video to wait for
            timeout: Maximum time to wait in seconds (default: 300)
            interval: How often to check status in seconds (default: 5)
            
        Returns:
            Dict containing the completed video information
        """
        start_time = time.time()
        
        while True:
            elapsed = time.time() - start_time
            if elapsed > timeout:
                raise TimeoutError(f"Video generation timed out after {timeout} seconds")
            
            status = self.check_video_status(video_id)
            
            if status["status"] == "completed":
                return status
            elif status["status"] == "failed":
                error_msg = status.get("error", {}).get("message", "Unknown error")
                raise Exception(f"Video generation failed: {error_msg}")
            
            # Wait before checking again
            time.sleep(interval)

    # Photo Avatar Methods
    
    def generate_avatar_photos(
        self,
        name: str,
        age: str,
        gender: str,
        ethnicity: str,
        orientation: str = "horizontal",
        pose: str = "half_body",
        style: str = "Realistic",
        appearance: str = ""
    ) -> Dict[str, Any]:
        """
        Generate AI avatar photos based on specified attributes.
        
        Args:
            name: Name for the avatar
            age: Age group (e.g., "Young Adult", "Adult", "Senior")
            gender: Gender of avatar (e.g., "Woman", "Man")
            ethnicity: Ethnicity (e.g., "Asian American", "African American", "European")
            orientation: Image orientation ("horizontal" or "vertical")
            pose: Avatar pose ("half_body", "full_body", "head")
            style: Visual style ("Realistic", "Stylized", etc.)
            appearance: Detailed prompt describing the avatar's appearance
            
        Returns:
            Dict containing the generation_id for the avatar photos
        """
        url = f"{self.base_url}/v2/photo_avatar/photo/generate"
        
        payload = {
            "name": name,
            "age": age,
            "gender": gender,
            "ethnicity": ethnicity,
            "orientation": orientation,
            "pose": pose,
            "style": style,
            "appearance": appearance
        }
        
        try:
            response = requests.post(url, headers=self.headers, json=payload)
            response.raise_for_status()
            data = response.json()
            
            if data.get("error"):
                logger.error(f"Heygen API error: {data.get('error')}")
                raise Exception(f"Heygen API error: {data.get('error')}")
                
            return {
                "generation_id": data.get("data", {}).get("generation_id")
            }
        except requests.RequestException as e:
            logger.error(f"Error generating avatar photos: {str(e)}")
            raise Exception(f"Failed to generate avatar photos: {str(e)}")
    
    def check_photo_generation_status(self, generation_id: str) -> Dict[str, Any]:
        """
        Check the status of avatar photo generation.
        
        Args:
            generation_id: The ID of the photo generation to check
            
        Returns:
            Dict containing the status and image URLs (if completed)
        """
        url = f"{self.base_url}/v2/photo_avatar/generation/{generation_id}"
        
        try:
            response = requests.get(url, headers=self.headers)
            response.raise_for_status()
            data = response.json()
            
            if data.get("error"):
                logger.error(f"Heygen API error: {data.get('error')}")
                raise Exception(f"Heygen API error: {data.get('error')}")
                
            return data.get("data", {})
        except requests.RequestException as e:
            logger.error(f"Error checking photo generation status: {str(e)}")
            raise Exception(f"Failed to check photo generation status: {str(e)}")
    
    def create_avatar_group(
        self,
        name: str,
        image_keys: List[str],
        description: str = ""
    ) -> Dict[str, Any]:
        """
        Create an avatar group from generated photos.
        
        Args:
            name: Name for the avatar group
            image_keys: List of image keys from the generated photos
            description: Optional description for the avatar group
            
        Returns:
            Dict containing the group ID and other info
        """
        url = f"{self.base_url}/v2/photo_avatar/group"
        
        payload = {
            "name": name,
            "image_key_list": image_keys,
            "description": description
        }
        
        try:
            response = requests.post(url, headers=self.headers, json=payload)
            response.raise_for_status()
            data = response.json()
            
            if data.get("error"):
                logger.error(f"Heygen API error: {data.get('error')}")
                raise Exception(f"Heygen API error: {data.get('error')}")
                
            return data.get("data", {})
        except requests.RequestException as e:
            logger.error(f"Error creating avatar group: {str(e)}")
            raise Exception(f"Failed to create avatar group: {str(e)}")
    
    def train_avatar_group(self, group_id: str) -> Dict[str, Any]:
        """
        Train an avatar group to create a model.
        
        Args:
            group_id: The ID of the avatar group to train
            
        Returns:
            Dict containing the training job ID
        """
        url = f"{self.base_url}/v2/photo_avatar/group/train"
        
        payload = {
            "group_id": group_id
        }
        
        try:
            response = requests.post(url, headers=self.headers, json=payload)
            response.raise_for_status()
            data = response.json()
            
            if data.get("error"):
                logger.error(f"Heygen API error: {data.get('error')}")
                raise Exception(f"Heygen API error: {data.get('error')}")
                
            return data.get("data", {})
        except requests.RequestException as e:
            logger.error(f"Error training avatar group: {str(e)}")
            raise Exception(f"Failed to train avatar group: {str(e)}")
    
    def check_training_status(self, job_id: str) -> Dict[str, Any]:
        """
        Check the status of avatar group training.
        
        Args:
            job_id: The ID of the training job to check
            
        Returns:
            Dict containing the training status
        """
        url = f"{self.base_url}/v2/photo_avatar/group/train/{job_id}"
        
        try:
            response = requests.get(url, headers=self.headers)
            response.raise_for_status()
            data = response.json()
            
            if data.get("error"):
                logger.error(f"Heygen API error: {data.get('error')}")
                raise Exception(f"Heygen API error: {data.get('error')}")
                
            return data.get("data", {})
        except requests.RequestException as e:
            logger.error(f"Error checking training status: {str(e)}")
            raise Exception(f"Failed to check training status: {str(e)}")
    
    def generate_avatar_looks(
        self,
        group_id: str,
        prompt: str,
        num_images: int = 4
    ) -> Dict[str, Any]:
        """
        Generate new looks for an avatar based on a text prompt.
        
        Args:
            group_id: The ID of the trained avatar group
            prompt: Text description of the desired look
            num_images: Number of variations to generate (1-4)
            
        Returns:
            Dict containing the generation ID
        """
        url = f"{self.base_url}/v2/photo_avatar/look/generate"
        
        payload = {
            "group_id": group_id,
            "prompt": prompt,
            "num_images": num_images
        }
        
        try:
            response = requests.post(url, headers=self.headers, json=payload)
            response.raise_for_status()
            data = response.json()
            
            if data.get("error"):
                logger.error(f"Heygen API error: {data.get('error')}")
                raise Exception(f"Heygen API error: {data.get('error')}")
                
            return data.get("data", {})
        except requests.RequestException as e:
            logger.error(f"Error generating avatar looks: {str(e)}")
            raise Exception(f"Failed to generate avatar looks: {str(e)}")
    
    def add_motion_to_avatar(
        self,
        avatar_id: str,
        motion_type: str
    ) -> Dict[str, Any]:
        """
        Add motion effect to a photo avatar.
        
        Args:
            avatar_id: The ID of the photo avatar
            motion_type: Type of motion to add ("talking", "nodding", etc.)
            
        Returns:
            Dict containing the result
        """
        url = f"{self.base_url}/v2/photo_avatar/motion"
        
        payload = {
            "avatar_id": avatar_id,
            "motion_type": motion_type
        }
        
        try:
            response = requests.post(url, headers=self.headers, json=payload)
            response.raise_for_status()
            data = response.json()
            
            if data.get("error"):
                logger.error(f"Heygen API error: {data.get('error')}")
                raise Exception(f"Heygen API error: {data.get('error')}")
                
            return data.get("data", {})
        except requests.RequestException as e:
            logger.error(f"Error adding motion to avatar: {str(e)}")
            raise Exception(f"Failed to add motion to avatar: {str(e)}")
    
    def add_sound_effect(
        self,
        avatar_id: str,
        sound_type: str
    ) -> Dict[str, Any]:
        """
        Add sound effect to a photo avatar.
        
        Args:
            avatar_id: The ID of the photo avatar
            sound_type: Type of sound effect to add
            
        Returns:
            Dict containing the result
        """
        url = f"{self.base_url}/v2/photo_avatar/sound_effect"
        
        payload = {
            "avatar_id": avatar_id,
            "sound_type": sound_type
        }
        
        try:
            response = requests.post(url, headers=self.headers, json=payload)
            response.raise_for_status()
            data = response.json()
            
            if data.get("error"):
                logger.error(f"Heygen API error: {data.get('error')}")
                raise Exception(f"Heygen API error: {data.get('error')}")
                
            return data.get("data", {})
        except requests.RequestException as e:
            logger.error(f"Error adding sound effect to avatar: {str(e)}")
            raise Exception(f"Failed to add sound effect to avatar: {str(e)}")


# Create a singleton instance of the service
heygen_service = HeygenService() 