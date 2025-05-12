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
    
