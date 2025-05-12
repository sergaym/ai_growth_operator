"""
Text-to-Image API endpoints.
"""

import os
from typing import Dict, List, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, UploadFile, File, Form, Body, Path

from app.api.v1.schemas import (
    AvatarParameters,
    GenerateImageRequest,
    GenerateAvatarRequest,
    UploadImageRequest,
    UploadImageResponse,
    ImageGenerationResponse,
)
from app.api.v1.services.text_to_image_service import text_to_image_service

# Create router for text-to-image endpoints
router = APIRouter()

@router.post("/generate", response_model=ImageGenerationResponse, summary="Generate image from text")
async def generate_image(request: GenerateImageRequest):
    """
    Generate an image from a text prompt or avatar parameters.
    
    - **prompt**: Text prompt describing the desired image
    - **params**: (Optional) Parameters for avatar generation
    - **negative_prompt**: (Optional) What to avoid in the image
    - **num_inference_steps**: (Optional) Number of inference steps
    - **guidance_scale**: (Optional) Guidance scale for prompt adherence
    - **save_image**: (Optional) Whether to save the image to disk
    
    Returns information about the generated image, including URLs and paths.
    """
    if not request.prompt and not request.params:
        raise HTTPException(status_code=400, detail="Either prompt or params must be provided")
    
    # Set default storage directory
    output_dir = os.path.join(os.getcwd(), "output", "images")
    
    result = await text_to_image_service.generate_image(
        prompt=request.prompt,
        params=request.params.dict() if request.params else None,
        negative_prompt=request.negative_prompt,
        num_inference_steps=request.num_inference_steps,
        guidance_scale=request.guidance_scale,
        output_dir=output_dir,
        save_image=request.save_image
    )
    
    if result["status"] == "failed":
        raise HTTPException(status_code=500, detail=result.get("error", "Failed to generate image"))
    
    return result

