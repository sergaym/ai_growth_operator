"""
Main API router for v1 of the AI Growth Operator API.
"""

from fastapi import APIRouter

# Import endpoint routers
from app.api.v1.endpoints.text_to_image import router as text_to_image_router
from app.api.v1.endpoints.text_to_speech import router as text_to_speech_router
from app.api.v1.endpoints.image_to_video import router as image_to_video_router
from app.api.v1.endpoints.lipsync import router as lipsync_router
from app.api.v1.endpoints.video_generation import router as video_generation_router
from app.api.v1.endpoints.auth import router as auth_router
from app.api.v1.endpoints.workspaces import router as workspaces_router
from app.api.v1.endpoints.subscriptions import router as subscriptions_router

# Create main API router for v1
api_router = APIRouter()

# Include endpoint routers
api_router.include_router(text_to_image_router, prefix="/text-to-image", tags=["Text-to-Image Generation"])
api_router.include_router(text_to_speech_router, prefix="/text-to-speech", tags=["Text-to-Speech Generation"])
api_router.include_router(image_to_video_router, prefix="/image-to-video", tags=["Image-to-Video Generation"])
api_router.include_router(lipsync_router, prefix="/lipsync", tags=["Lipsync Generation"])
api_router.include_router(video_generation_router, prefix="/video-generation", tags=["Video Generation"])
api_router.include_router(auth_router, prefix="/auth", tags=["Auth"])
api_router.include_router(workspaces_router, prefix="/workspaces", tags=["Workspaces"])
api_router.include_router(subscriptions_router, prefix="/subscriptions", tags=["Subscriptions"])
