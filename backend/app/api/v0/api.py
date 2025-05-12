"""
Main API router for v0 (legacy) of the AI Growth Operator API.
"""

from fastapi import APIRouter

# Import all endpoint routers
from app.api.v0.endpoints.idea import router as idea_router
from app.api.v0.endpoints.marketing import router as marketing_router
from app.api.v0.endpoints.styles import router as styles_router
# Import video router (which includes both luma and heygen)
from app.api.v0.endpoints.video import router as video_router

# Create main API router for v0
api_router = APIRouter()

# Include all endpoint routers with their prefixes
api_router.include_router(idea_router, prefix="/idea", tags=["Idea Generation"])
api_router.include_router(marketing_router, prefix="/marketing", tags=["Marketing"])
api_router.include_router(video_router, prefix="/video", tags=["Video Generation"])
api_router.include_router(styles_router, prefix="/styles", tags=["Styles"]) 