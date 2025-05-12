"""
Luma AI service integration for the AI Growth Operator.
This module provides all interactions with the Luma AI API for video generation.
"""

import os
import time
import uuid
import requests
from typing import Dict, List, Any, Optional
from dotenv import load_dotenv

# Import settings
from app.core.config import settings

# Load environment variables
load_dotenv()

# Luma AI API constants
LUMA_POLLING_INTERVAL = 10  # seconds

class LumaService:
    """Service class for Luma AI video generation"""
    
    def __init__(self, api_key=None):
        """Initialize the Luma AI service"""
        self.api_key = api_key or os.getenv("LUMAAI_API_KEY") or settings.LUMAAI_API_KEY
        if not self.api_key:
            raise ValueError("Luma AI API key not found. Please set LUMAAI_API_KEY in your environment.")
        
        self.base_url = "https://api.lumalabs.ai/v1"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
    
    def generate_video(
        self,
        prompt: str,
        visual_style: Optional[str] = None,
        duration: str = "30 seconds",
        aspect_ratio: str = "16:9",
        music_type: Optional[str] = None,
        include_text_overlays: bool = True,
        media_references: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """
        Generate a video using Luma AI based on a prompt.
        """
        # Enhance the prompt based on visual style if provided
        enhanced_prompt = prompt
        if visual_style:
            enhanced_prompt = f"{visual_style.title()} style: {prompt}"
        
        # Add duration information to the prompt
        enhanced_prompt = f"{enhanced_prompt} The video should be approximately {duration} long."
        
        # Parse duration for the API
        duration_formatted = self._format_duration_for_api(duration)
        
        # Add music information if provided
        if music_type:
            enhanced_prompt = f"{enhanced_prompt} The video should have {music_type} music."
        
        # Prepare generation parameters
        params = {
            "prompt": enhanced_prompt,
            "model": "ray-2",  # Using Ray 2 for best quality
            "duration": duration_formatted,
            "aspect_ratio": aspect_ratio,
        }
        
        # Add keyframes for reference media if provided
        if media_references and len(media_references) > 0:
            keyframes = {}
            for i, ref in enumerate(media_references):
                if ref["type"].lower() == "image":
                    # Add image as a keyframe
                    frame_key = f"frame{i}"
                    keyframes[frame_key] = {
                        "type": "image",
                        "url": ref["url"]
                    }
                    
                    # Add weight if provided
                    if "weight" in ref:
                        keyframes[frame_key]["weight"] = ref["weight"]
            
            if keyframes:
                params["keyframes"] = keyframes
        
        # Generate a unique ID to track this generation
        generation_id = str(uuid.uuid4())
        
        try:
            # Create the generation via API request
            response = requests.post(
                f"{self.base_url}/generations",
                json=params,
                headers=self.headers
            )
            response.raise_for_status()
            generation_data = response.json()
            
            # Return initial response with generation details
            result = {
                "generation_id": generation_data["id"],
                "prompt_used": enhanced_prompt,
                "status": "processing",
                "estimated_completion_time": self._estimate_completion_time(
                    self._parse_duration_to_seconds(duration)
                ),
                "duration": duration
            }
            
            return result
        
        except Exception as e:
            raise Exception(f"Error in Luma AI generation: {str(e)}")
    
    def generate_video_with_references(
        self,
        prompt: str,
        media_references: List[Dict[str, Any]],
        settings: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Generate a video using specific media references (images/videos) as style or content guides.
        """
        # Extract settings
        visual_style = settings.get("visual_style")
        duration = settings.get("duration", "30 seconds")
        aspect_ratio = settings.get("aspect_ratio", "16:9")
        music_type = settings.get("music_type")
        include_text_overlays = settings.get("include_text_overlays", True)
        
        # Use the main generate_video function with the media references
        return self.generate_video(
            prompt=prompt,
            visual_style=visual_style,
            duration=duration,
            aspect_ratio=aspect_ratio,
            music_type=music_type,
            include_text_overlays=include_text_overlays,
            media_references=media_references
        )

    def check_video_status(self, generation_id: str) -> Dict[str, Any]:
        """
        Check the status of a video generation job.
        """
        try:
            # Get the generation status via API request
            response = requests.get(
                f"{self.base_url}/generations/{generation_id}",
                headers=self.headers
            )
            response.raise_for_status()
            generation = response.json()
            
            # Extract common fields
            prompt_used = generation.get("prompt", "No prompt available")
            duration = generation.get("duration", "Unknown")
            
            # Build base result with fields required by the response model
            base_result = {
                "generation_id": generation_id,
                "prompt_used": prompt_used,
                "duration": duration
            }
            
            # Determine the status and add status-specific fields
            if generation.get("state") == "completed":
                result = {
                    **base_result,
                    "status": "completed",
                    "video_url": generation.get("assets", {}).get("video"),
                    "thumbnail_url": generation.get("assets", {}).get("thumbnail"),
                }
            elif generation.get("state") == "failed":
                result = {
                    **base_result,
                    "status": "failed",
                    "error": generation.get("failure_reason", "Unknown error")
                }
            else:
                # Still processing
                result = {
                    **base_result,
                    "status": "processing",
                    "estimated_completion_time": self._estimate_completion_time(
                        self._parse_duration_to_seconds(duration)
                    ),
                }
            
            return result
            
        except Exception as e:
            raise Exception(f"Error checking Luma AI generation status: {str(e)}")
    
    def wait_for_video_completion(
        self, 
        generation_id: str, 
        timeout: int = 300
    ) -> Dict[str, Any]:
        """
        Wait for a video generation to complete, with polling.
        
        Args:
            generation_id: The unique ID of the generation job
            timeout: Maximum time to wait in seconds (default: 5 minutes)
            
        Returns:
            Dictionary containing the final status
        """
        start_time = time.time()
        while time.time() - start_time < timeout:
            # Get current status
            status = self.check_video_status(generation_id)
            
            # Check if completed or failed
            if status["status"] in ["completed", "failed"]:
                return status
            
            # Sleep before next poll
            time.sleep(LUMA_POLLING_INTERVAL)
        
        # If we reach here, timeout occurred
        return {
            "generation_id": generation_id,
            "status": "timeout",
            "error": f"Generation timed out after {timeout} seconds"
        }
    
    def _parse_duration_to_seconds(self, duration: str) -> int:
        """
        Parse a duration string like "30 seconds" or "2 minutes" to seconds.
        
        Args:
            duration: A string describing the duration
            
        Returns:
            Duration in seconds
        """
        duration = duration.lower().strip()
        
        # Handle simple "Xs" format
        if duration.endswith("s") and duration[:-1].strip().isdigit():
            return int(duration[:-1].strip())
        
        if "second" in duration:
            seconds = int(''.join(filter(str.isdigit, duration.split("second")[0])))
            return seconds
        
        if "minute" in duration:
            minutes = int(''.join(filter(str.isdigit, duration.split("minute")[0])))
            return minutes * 60
        
        # Default case - try to extract a number and assume seconds
        try:
            return int(''.join(filter(str.isdigit, duration)))
        except:
            # If all else fails, return a default value
            return 30
    
    def _format_duration_for_api(self, duration: str) -> str:
        """
        Format duration for Luma API.
        
        Args:
            duration: A string describing the duration
            
        Returns:
            Formatted duration string (e.g., "5s")
        """
        seconds = self._parse_duration_to_seconds(duration)
        return f"{seconds}s"
    
    def _estimate_completion_time(self, duration_seconds: int) -> str:
        """
        Estimate when the video generation will complete.
        
        Args:
            duration_seconds: Duration of the video in seconds
            
        Returns:
            Estimated completion time as a string
        """
        # Calculate estimated completion time
        # Base time for any video generation
        base_processing_time = 60  # seconds
        
        # Additional time based on video duration (rough estimate)
        duration_factor = 5  # 5 seconds of processing per second of video
        additional_time = duration_seconds * duration_factor
        
        # Total estimated time
        total_estimated_seconds = base_processing_time + additional_time
        
        # Add buffer for safety
        total_estimated_seconds = int(total_estimated_seconds * 1.2)
        
        # Format as minutes and seconds
        minutes = total_estimated_seconds // 60
        seconds = total_estimated_seconds % 60
        
        if minutes > 0:
            return f"approximately {minutes} minutes and {seconds} seconds"
        else:
            return f"approximately {seconds} seconds"

# Create a singleton instance of the service
luma_service = LumaService() 