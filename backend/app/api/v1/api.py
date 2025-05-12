"""
Main API router for v1 of the AI Growth Operator API.
"""

from fastapi import APIRouter

# Import endpoint routers
from app.api.v1.endpoints.text_to_image import router as text_to_image_router

# Create main API router for v1
api_router = APIRouter()

# Include endpoint router
api_router.include_router(text_to_image_router, prefix="/text-to-image", tags=["Text-to-Image Generation"])