import os
import time
import requests
from lumaai import LumaAI
from typing import Dict, Optional, Any

from ..config.env import (
    LUMAAI_API_KEY,
    DEFAULT_VIDEO_DURATION,
    DEFAULT_RESOLUTION,
    DEFAULT_MODEL,
    ENABLE_LOOP,
    VIDEO_OUTPUT_DIR
)

class LumaVideoGenerator:
    """
    A class to generate videos using Luma AI's API.
    """
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize the Luma AI client.
        
        Args:
            api_key: Optional API key. If not provided, will use the one from environment variables.
        """
        self.api_key = api_key or LUMAAI_API_KEY
        if not self.api_key:
            raise ValueError("Luma AI API key is required. Set it in the .env file or pass it to the constructor.")
        
        self.client = LumaAI(auth_token=self.api_key)
    
    def generate_video_from_text(
        self,
        prompt: str,
        model: str = DEFAULT_MODEL,
        resolution: str = DEFAULT_RESOLUTION,
        duration: str = DEFAULT_VIDEO_DURATION,
        loop: bool = ENABLE_LOOP,
        aspect_ratio: Optional[str] = None,
        save_video: bool = True,
        output_filename: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generate a video from text prompt.
        
        Args:
            prompt: Text description of the video to generate
            model: AI model to use (default: ray-2)
            resolution: Video resolution (default: 720p)
            duration: Video duration (default: 5s)
            loop: Whether to create a looping video
            aspect_ratio: Aspect ratio (e.g., "16:9", "4:3", "1:1")
            save_video: Whether to save the video to disk
            output_filename: Optional filename for the saved video
            
        Returns:
            Dictionary containing generation details including video URL
        """
        print(f"Generating video with prompt: '{prompt}'")
        
        # Set up generation parameters
        params = {
            "prompt": prompt,
            "model": model,
            "resolution": resolution,
            "duration": duration,
            "loop": loop
        }
        
        # Add optional aspect ratio if provided
        if aspect_ratio:
            params["aspect_ratio"] = aspect_ratio
            
        # Start generation
        generation = self.client.generations.create(**params)
        
        # Poll until generation is complete
        while True:
            generation = self.client.generations.get(id=generation.id)
            
            if generation.state == "completed":
                print(f"✅ Video generation completed: {generation.id}")
                break
            elif generation.state == "failed":
                error_message = getattr(generation, 'failure_reason', 'Unknown error')
                raise RuntimeError(f"Video generation failed: {error_message}")
                
            print("🎬 Generating video... please wait")
            time.sleep(3)
        
        video_url = generation.assets.video
        
        # Save video if requested
        if save_video and video_url:
            if not output_filename:
                # Generate a filename based on the first few words of the prompt
                prompt_words = prompt.split()[:5]  # Take first 5 words
                filename_base = "_".join(prompt_words).lower()
                filename_base = "".join(c if c.isalnum() or c == '_' else '_' for c in filename_base)
                output_filename = f"{filename_base}_{generation.id}.mp4"
            
            output_path = os.path.join(VIDEO_OUTPUT_DIR, output_filename)
            self._download_video(video_url, output_path)
            
            # Add the local file path to the generation info
            generation.local_file_path = output_path
        
        return generation
    
    def generate_video_from_image(
        self,
        prompt: str,
        image_url: str,
        model: str = DEFAULT_MODEL,
        loop: bool = ENABLE_LOOP,
        save_video: bool = True,
        output_filename: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generate a video from a text prompt and an initial image.
        
        Args:
            prompt: Text description of the video to generate
            image_url: URL of the image to use as the starting frame
            model: AI model to use
            loop: Whether to create a looping video
            save_video: Whether to save the video to disk
            output_filename: Optional filename for the saved video
            
        Returns:
            Dictionary containing generation details including video URL
        """
        print(f"Generating video from image with prompt: '{prompt}'")
        
        # Set up keyframes with the starting image
        keyframes = {
            "frame0": {
                "type": "image",
                "url": image_url
            }
        }
        
        # Start generation
        generation = self.client.generations.create(
            prompt=prompt,
            model=model,
            loop=loop,
            keyframes=keyframes
        )
        
        # Poll until generation is complete
        while True:
            generation = self.client.generations.get(id=generation.id)
            
            if generation.state == "completed":
                print(f"✅ Video generation completed: {generation.id}")
                break
            elif generation.state == "failed":
                error_message = getattr(generation, 'failure_reason', 'Unknown error')
                raise RuntimeError(f"Video generation failed: {error_message}")
                
            print("🎬 Generating video from image... please wait")
            time.sleep(3)
        
        video_url = generation.assets.video
        
        # Save video if requested
        if save_video and video_url:
            if not output_filename:
                # Generate a filename based on the first few words of the prompt
                prompt_words = prompt.split()[:5]  # Take first 5 words
                filename_base = "_".join(prompt_words).lower()
                filename_base = "".join(c if c.isalnum() or c == '_' else '_' for c in filename_base)
                output_filename = f"{filename_base}_{generation.id}.mp4"
            
            output_path = os.path.join(VIDEO_OUTPUT_DIR, output_filename)
            self._download_video(video_url, output_path)
            
            # Add the local file path to the generation info
            generation.local_file_path = output_path
        
        return generation
    
    def _download_video(self, video_url: str, output_path: str) -> None:
        """
        Download a video from a URL and save it to disk.
        
        Args:
            video_url: URL of the video to download
            output_path: Path where the video will be saved
        """
        try:
            print(f"Downloading video to {output_path}")
            response = requests.get(video_url, stream=True)
            response.raise_for_status()
            
            with open(output_path, 'wb') as file:
                file.write(response.content)
                
            print(f"Video saved to {output_path}")
            
        except Exception as e:
            print(f"Error downloading video: {str(e)}")
            raise 