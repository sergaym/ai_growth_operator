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
