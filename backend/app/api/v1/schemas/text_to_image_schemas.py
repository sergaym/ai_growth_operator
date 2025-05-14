"""
Text-to-Image schemas for the AI Growth Operator API (v1).
"""

from typing import List, Dict, Any, Optional, Union
from pydantic import BaseModel, Field, HttpUrl, validator

class AvatarParameters(BaseModel):
    """Parameters for avatar generation."""
    gender: Optional[str] = Field(None, description="Gender (e.g., 'male', 'female', 'non-binary')")
    age: Optional[str] = Field(None, description="Age (e.g., '25', 'middle-aged', 'elderly')")
    ethnicity: Optional[str] = Field(None, description="Ethnicity or cultural background")
    skin_tone: Optional[str] = Field(None, description="Skin tone description")
    hair_style: Optional[str] = Field(None, description="Hair style description")
    hair_color: Optional[str] = Field(None, description="Hair color description")
    facial_features: Optional[str] = Field(None, description="Notable facial features")
    expression: Optional[str] = Field(None, description="Facial expression")
    style: Optional[str] = Field(None, description="Visual style")
    background: Optional[str] = Field(None, description="Background description")
    lighting: Optional[str] = Field(None, description="Lighting description")
    custom_prompt: Optional[str] = Field(None, description="Additional custom elements")
    
    class Config:
        schema_extra = {
            "example": {
                "gender": "female",
                "age": "35",
                "ethnicity": "East Asian",
                "skin_tone": "medium",
                "hair_style": "shoulder-length",
                "hair_color": "black",
                "expression": "friendly smile",
                "style": "professional",
                "background": "gradient blue",
                "lighting": "soft natural"
            }
        }

class GenerateImageRequest(BaseModel):
    """Request model for general image generation."""
    prompt: Optional[str] = Field(None, description="Text prompt for image generation")
    params: Optional[AvatarParameters] = Field(None, description="Parameters for avatar generation")
    negative_prompt: Optional[str] = Field(
        "deformed faces, unrealistic features, cartoon-like, illustration, painting, drawing, artificial looking, low quality, blurry", 
        description="What to avoid in the image"
    )
    num_inference_steps: Optional[int] = Field(50, description="Number of inference steps")
    guidance_scale: Optional[float] = Field(7.5, description="Guidance scale for prompt adherence")
    save_image: Optional[bool] = Field(True, description="Whether to save the image to disk")
    upload_to_blob: Optional[bool] = Field(True, description="Whether to upload the image to blob storage")
    output_dir: Optional[str] = Field(None, description="Directory to save the generated image")
    user_id: Optional[str] = Field(None, description="User ID to associate with the image")
    workspace_id: Optional[str] = Field(None, description="Workspace ID to associate with the image")
    
    @validator('prompt', 'params')
    def validate_prompt_or_params(cls, v, values):
        # Either prompt or params must be provided
        if 'prompt' not in values and 'params' not in values:
            if not v:  # If the current field being validated is also None
                raise ValueError("Either prompt or params must be provided")
        return v
    
    class Config:
        schema_extra = {
            "example": {
                "prompt": "A hyperrealistic portrait of a professional woman with a friendly smile, suitable for a corporate website, high quality, 8k",
                "negative_prompt": "deformed faces, unrealistic features, cartoon-like, low quality",
                "num_inference_steps": 50,
                "guidance_scale": 7.5,
                "save_image": True,
                "upload_to_blob": True
            }
        }

class GenerateAvatarRequest(BaseModel):
    """Request model for avatar generation."""
    gender: Optional[str] = Field(None, description="Gender (e.g., 'male', 'female', 'non-binary')")
    age: Optional[str] = Field(None, description="Age (e.g., '25', 'middle-aged', 'elderly')")
    ethnicity: Optional[str] = Field(None, description="Ethnicity or cultural background")
    skin_tone: Optional[str] = Field(None, description="Skin tone description")
    hair_style: Optional[str] = Field(None, description="Hair style description")
    hair_color: Optional[str] = Field(None, description="Hair color description")
    facial_features: Optional[str] = Field(None, description="Notable facial features")
    expression: Optional[str] = Field("neutral", description="Facial expression")
    style: Optional[str] = Field(None, description="Visual style")
    background: Optional[str] = Field(None, description="Background description")
    lighting: Optional[str] = Field(None, description="Lighting description")
    custom_prompt: Optional[str] = Field(None, description="Additional custom elements")
    save_image: Optional[bool] = Field(True, description="Whether to save the image to disk")
    upload_to_blob: Optional[bool] = Field(True, description="Whether to upload the image to blob storage")
    output_dir: Optional[str] = Field(None, description="Directory to save the generated image")
    user_id: Optional[str] = Field(None, description="User ID to associate with the image")
    workspace_id: Optional[str] = Field(None, description="Workspace ID to associate with the image")
    
    class Config:
        schema_extra = {
            "example": {
                "gender": "female",
                "age": "35",
                "ethnicity": "East Asian",
                "expression": "friendly",
                "style": "professional",
                "custom_prompt": "suitable for corporate website, modern office background",
                "save_image": True
            }
        }

class UploadImageRequest(BaseModel):
    """Request model for uploading an image."""
    image_path: str = Field(..., description="Path to the image file to upload")

class UploadImageResponse(BaseModel):
    """Response model for an uploaded image."""
    url: str = Field(..., description="URL of the uploaded image")

class ImageGenerationResponse(BaseModel):
    """Response model for image generation."""
    request_id: str = Field(..., description="Unique identifier for the request")
    prompt: str = Field(..., description="The prompt used for generation")
    status: str = Field(..., description="Status of the generation (completed, failed)")
    timestamp: int = Field(..., description="Generation timestamp")
    image_data: Optional[str] = Field(None, description="Base64 encoded image data")
    image_urls: Optional[List[str]] = Field(None, description="URLs of the generated images")
    image_paths: Optional[List[str]] = Field(None, description="Local paths to the generated images")
    blob_urls: Optional[List[str]] = Field(None, description="Blob storage URLs of the generated images")
    image_saved: Optional[bool] = Field(None, description="Whether the image was saved to disk")
    db_id: Optional[str] = Field(None, description="Database ID of the saved image record")
    error: Optional[str] = Field(None, description="Error message if generation failed")
    
    class Config:
        schema_extra = {
            "example": {
                "request_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
                "prompt": "A hyperrealistic portrait of a professional woman with a friendly smile",
                "status": "completed",
                "timestamp": 1620000000,
                "image_urls": ["https://example.com/images/generated.png"],
                "image_saved": True,
                "blob_urls": ["https://example.blob.core.windows.net/images/generated.png"],
                "db_id": "550e8400-e29b-41d4-a716-446655440000"
            }
        } 