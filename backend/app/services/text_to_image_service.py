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

# Import database components
from app.db import get_db, image_repository
from app.db.blob_storage import upload_file, AssetType

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
        save_image: bool = True,
        upload_to_blob: bool = True,
        user_id: Optional[str] = None,
        workspace_id: Optional[str] = None
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
            upload_to_blob: Whether to upload the image to blob storage
            user_id: Optional user ID to associate with the image
            workspace_id: Optional workspace ID to associate with the image
            
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
                blob_urls = []
                
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
                                
                                # Upload to blob storage if requested
                                if upload_to_blob and settings.BLOB_READ_WRITE_TOKEN:
                                    try:
                                        blob_result = await upload_file(
                                            file_content=image_bytes,
                                            asset_type=AssetType.IMAGES,
                                            filename=filename,
                                            content_type="image/png"
                                        )
                                        blob_urls.append(blob_result.get("url"))
                                    except Exception as e:
                                        print(f"Error uploading to blob storage: {str(e)}")
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
                                    
                                    # Upload to blob storage if requested
                                    if upload_to_blob and settings.BLOB_READ_WRITE_TOKEN:
                                        try:
                                            blob_result = await upload_file(
                                                file_content=response_data.content,
                                                asset_type=AssetType.IMAGES,
                                                filename=filename,
                                                content_type="image/png"
                                            )
                                            blob_urls.append(blob_result.get("url"))
                                        except Exception as e:
                                            print(f"Error uploading to blob storage: {str(e)}")
                            except Exception as e:
                                print(f"Error downloading image: {str(e)}")
                
                # Add image URLs and paths to response
                if image_urls:
                    response["image_urls"] = image_urls
                if image_paths:
                    response["image_paths"] = image_paths
                if blob_urls:
                    response["blob_urls"] = blob_urls
                
                # Add image saved status
                response["image_saved"] = image_saved
                
                # Save to database
                try:
                    # Use first image for database storage
                    db_data = {
                        "prompt": prompt,
                        "negative_prompt": negative_prompt,
                        "guidance_scale": guidance_scale,
                        "num_inference_steps": num_inference_steps,
                        "status": "completed",
                        "metadata": {
                            "params": params,
                            "result": result
                        }
                    }
                    
                    # Add file information if available
                    if image_paths:
                        db_data["file_path"] = image_paths[0]
                    if image_urls:
                        db_data["file_url"] = image_urls[0]
                    if blob_urls:
                        db_data["blob_url"] = blob_urls[0]
                    
                    # Add local URL if available
                    if "file://" in str(image_urls[0]) if image_urls else "":
                        db_data["local_url"] = image_urls[0]
                    
                    # Add user and workspace IDs if provided
                    if user_id:
                        db_data["user_id"] = user_id
                    if workspace_id:
                        db_data["workspace_id"] = workspace_id
                    
                    # Get a database session and save the image
                    db = next(get_db())
                    db_image = image_repository.create(db_data, db)
                    
                    if db_image:
                        response["db_id"] = db_image.id
                except Exception as e:
                    print(f"Error saving to database: {str(e)}")
            
            return response
        
        except Exception as e:
            # Handle errors
            error_data = {
                "request_id": request_id,
                "prompt": prompt,
                "status": "failed",
                "error": str(e),
                "timestamp": int(time.time())
            }
            
            # Try to save the error to database for tracking
            try:
                db = next(get_db())
                error_db_data = {
                    "prompt": prompt,
                    "negative_prompt": negative_prompt,
                    "guidance_scale": guidance_scale,
                    "num_inference_steps": num_inference_steps,
                    "status": "failed",
                    "metadata": {
                        "params": params,
                        "error": str(e)
                    }
                }
                
                # Add user and workspace IDs if provided
                if user_id:
                    error_db_data["user_id"] = user_id
                if workspace_id:
                    error_db_data["workspace_id"] = workspace_id
                
                db_image = image_repository.create(error_db_data, db)
                if db_image:
                    error_data["db_id"] = db_image.id
            except Exception as db_error:
                print(f"Error saving failed request to database: {str(db_error)}")
            
            return error_data
    
    async def generate_avatar(
        self,
        gender: Optional[str] = None,
        age: Optional[str] = None,
        ethnicity: Optional[str] = None,
        expression: Optional[str] = None,
        output_dir: Optional[str] = None,
        user_id: Optional[str] = None,
        workspace_id: Optional[str] = None,
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
            user_id: Optional user ID to associate with the avatar
            workspace_id: Optional workspace ID to associate with the avatar
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
        return await self.generate_image(
            params=params, 
            output_dir=output_dir,
            user_id=user_id,
            workspace_id=workspace_id
        )
    
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