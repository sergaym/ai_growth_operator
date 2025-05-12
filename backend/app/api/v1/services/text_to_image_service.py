"""
Text-to-Image service integration for the AI Growth Operator.
This module provides interactions with the fal.ai API for image generation.
"""

import os
import time
import uuid
import asyncio
import base64
from pathlib import Path
from typing import Dict, List, Any, Optional, Union

import fal_client
from dotenv import load_dotenv

# Import settings
from app.core.config import settings

# Load environment variables
load_dotenv()

# Constants
FAL_KEY = os.getenv("FAL_KEY") or os.getenv("FAL_API_KEY") or os.getenv("FAL_CLIENT_API_KEY")

class TextToImageService:
    """Service for generating images from text prompts using fal.ai"""
    
    def __init__(self):
        """Initialize the TextToImageService with API credentials"""
        self.api_key = FAL_KEY or settings.FAL_KEY
        if not self.api_key:
            raise ValueError("fal.ai API key not found. Please set FAL_KEY in your environment.")
        
        # Set the environment variable fal-client expects
        os.environ["FAL_KEY"] = self.api_key
    
    def build_avatar_prompt(
        self,
        gender: Optional[str] = None,
        age: Optional[str] = None,
        ethnicity: Optional[str] = None, 
        skin_tone: Optional[str] = None,
        hair_style: Optional[str] = None,
        hair_color: Optional[str] = None,
        facial_features: Optional[str] = None,
        expression: Optional[str] = None,
        style: Optional[str] = None,
        background: Optional[str] = None,
        lighting: Optional[str] = None,
        custom_prompt: Optional[str] = None
    ) -> str:
        """
        Build a comprehensive prompt for avatar generation based on parameters.
        
        Args:
            gender: Gender description (e.g., "male", "female", "non-binary")
            age: Age description (e.g., "25", "middle-aged", "elderly")
            ethnicity: Ethnicity or cultural background
            skin_tone: Skin tone description
            hair_style: Hair style description
            hair_color: Hair color description
            facial_features: Notable facial features
            expression: Facial expression
            style: Visual style
            background: Background description
            lighting: Lighting description
            custom_prompt: Additional custom elements
            
        Returns:
            A comprehensive prompt string for image generation
        """
        # Base prompt structure
        base_prompt = "Generate a hyperrealistic portrait of a"
        
        # Add gender
        if gender:
            if gender.lower() in ["male", "man"]:
                base_prompt += " man"
            elif gender.lower() in ["female", "woman"]:
                base_prompt += " woman"
            elif gender.lower() == "non-binary":
                base_prompt += " non-binary person"
            else:
                base_prompt += f" person with {gender} gender expression"
        else:
            base_prompt += " person"
        
        # Add age
        if age:
            if age.isdigit():
                base_prompt += f", {age} years old"
            else:
                base_prompt += f", {age}"
        
        # Add ethnicity/cultural background
        if ethnicity:
            base_prompt += f" of {ethnicity} descent"
        
        # Add skin tone
        if skin_tone:
            base_prompt += f" with {skin_tone} skin tone"
        
        # Add hair details
        hair_details = []
        if hair_style:
            hair_details.append(hair_style)
        if hair_color:
            hair_details.append(f"{hair_color} colored")
        
        if hair_details:
            hair_text = " and ".join(hair_details)
            base_prompt += f", {hair_text} hair"
        
        # Add facial features
        if facial_features:
            base_prompt += f", {facial_features}"
        
        # Add expression
        if expression:
            base_prompt += f", with a {expression} expression"
        
        # Add style specifications
        base_prompt += ". The portrait should be extremely photorealistic"
        if style:
            base_prompt += f", in {style} style"
        
        # Add background
        if background:
            base_prompt += f" with {background} background"
        
        # Add lighting
        if lighting:
            base_prompt += f" and {lighting} lighting"
        
        # Professional quality specifications
        base_prompt += ". Professional portrait photography, 8k, extremely detailed facial features, suitable for professional video avatars."
        
        # Add custom prompt elements at the end if provided
        if custom_prompt:
            base_prompt += f" {custom_prompt}"
        
        return base_prompt
    
    async def generate_image(
        self,
        prompt: Optional[str] = None,
        params: Optional[Dict[str, Any]] = None,
        negative_prompt: str = "deformed faces, unrealistic features, cartoon-like, illustration, painting, drawing, artificial looking, low quality, blurry",
        num_inference_steps: int = 50,
        guidance_scale: float = 7.5,
        output_dir: Optional[str] = None,
        save_image: bool = True
    ) -> Dict[str, Any]:
        """
        Generate an image from a text prompt.
        
        Args:
            prompt: Text prompt for image generation
            params: Parameters for avatar generation if using the avatar builder
            negative_prompt: Negative prompt for better quality
            num_inference_steps: Number of inference steps
            guidance_scale: Guidance scale for prompt adherence
            output_dir: Directory to save the generated image
            save_image: Whether to save the image to disk
            
        Returns:
            Dictionary containing the image data, URLs, and paths
        """
        # Build prompt from parameters if provided
        if params and not prompt:
            prompt = self.build_avatar_prompt(**params)
        
        if not prompt:
            raise ValueError("Either prompt or params must be provided")
        
        # Generate a unique ID for this request
        request_id = str(uuid.uuid4())
        
        try:
            # Submit the request with additional parameters for better face generation
            result = fal_client.subscribe(
                "fal-ai/flux/dev",
                arguments={
                    "prompt": prompt,
                    "negative_prompt": negative_prompt,
                    "num_inference_steps": num_inference_steps,
                    "guidance_scale": guidance_scale,
                },
            )
            
            # Prepare the result dictionary
            response = {
                "request_id": request_id,
                "prompt": prompt,
                "status": "completed",
                "timestamp": int(time.time())
            }
            
            # Extract images
            if "images" in result and isinstance(result["images"], list) and result["images"]:
                # Track if we actually saved an image
                image_saved = False
                image_urls = []
                image_paths = []
                
                if save_image and output_dir:
                    # Create output directory if it doesn't exist
                    output_path = Path(output_dir)
                    output_path.mkdir(exist_ok=True, parents=True)
                
                for i, image_data in enumerate(result["images"]):
                    # Handle base64 image data
                    if isinstance(image_data, str):
                        if "," in image_data and ";base64," in image_data:
                            image_data = image_data.split(";base64,")[1]
                        
                        if save_image and output_dir:
                            try:
                                image_bytes = base64.b64decode(image_data)
                                timestamp = int(time.time())
                                filename = f"avatar_{timestamp}_{i}.png"
                                filepath = output_path / filename
                                
                                with open(filepath, "wb") as f:
                                    f.write(image_bytes)
                                
                                image_saved = True
                                image_paths.append(str(filepath))
                                image_urls.append(f"file://{filepath}")
                            except Exception as e:
                                print(f"Error saving image: {str(e)}")
                        
                        # Always include the base64 data in the response
                        response["image_data"] = f"data:image/png;base64,{image_data}"
                    
                    # Handle URL image
                    elif isinstance(image_data, dict) and "url" in image_data:
                        url = image_data["url"]
                        image_urls.append(url)
                        
                        if save_image and output_dir:
                            try:
                                import requests
                                response_data = requests.get(url)
                                if response_data.status_code == 200:
                                    timestamp = int(time.time())
                                    filename = f"avatar_{timestamp}_{i}.png"
                                    filepath = output_path / filename
                                    
                                    with open(filepath, "wb") as f:
                                        f.write(response_data.content)
                                    
                                    image_saved = True
                                    image_paths.append(str(filepath))
                            except Exception as e:
                                print(f"Error downloading image: {str(e)}")
                
                # Add image URLs and paths to response
                if image_urls:
                    response["image_urls"] = image_urls
                if image_paths:
                    response["image_paths"] = image_paths
                
                # Add image saved status
                response["image_saved"] = image_saved
            
            return response
        
        except Exception as e:
            # Handle errors
            return {
                "request_id": request_id,
                "prompt": prompt,
                "status": "failed",
                "error": str(e),
                "timestamp": int(time.time())
            }
    
    async def generate_avatar(
        self,
        gender: Optional[str] = None,
        age: Optional[str] = None,
        ethnicity: Optional[str] = None,
        expression: Optional[str] = None,
        output_dir: Optional[str] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Convenience method to generate an avatar with specific characteristics.
        
        Args:
            gender: Gender of the avatar
            age: Age of the avatar
            ethnicity: Ethnicity of the avatar
            expression: Expression of the avatar
            output_dir: Directory to save the generated avatar
            **kwargs: Additional parameters for the avatar builder
            
        Returns:
            Dictionary containing the avatar image data, URLs, and paths
        """
        # Prepare avatar parameters
        params = {
            "gender": gender,
            "age": age,
            "ethnicity": ethnicity,
            "expression": expression,
            **kwargs
        }
        
        # Filter out None values
        params = {k: v for k, v in params.items() if v is not None}
        
        # Generate the avatar
        return await self.generate_image(params=params, output_dir=output_dir)
    
    async def upload_image(self, image_path: str) -> str:
        """
        Upload an image to the fal.ai platform.
        
        Args:
            image_path: Path to the image file to upload
            
        Returns:
            URL of the uploaded image
        """
        try:
            # Upload the image
            upload_response = await fal_client.upload_file_async(image_path)
            return upload_response
        except Exception as e:
            raise Exception(f"Error uploading image: {str(e)}")


# Create a singleton instance of the service
text_to_image_service = TextToImageService() 