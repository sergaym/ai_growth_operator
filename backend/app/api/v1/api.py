"""
Main API router for v1 of the AI Growth Operator API.
"""

from fastapi import APIRouter

# Import all endpoint routers
from app.api.v1.endpoints.idea import router as idea_router
from app.api.v1.endpoints.video import router as video_router
from app.api.v1.endpoints.styles import router as styles_router

# Create main API router for v1
api_router = APIRouter()

# Include all endpoint routers with their prefixes
api_router.include_router(idea_router, prefix="/idea", tags=["Idea Generation"])
api_router.include_router(video_router, prefix="/video", tags=["Video"])
api_router.include_router(styles_router, prefix="/styles", tags=["Styles"]) 