"""
Main API router for v1 of the AI Growth Operator API.
"""

from fastapi import APIRouter

# Import all endpoint routers
from app.api.v1.endpoints.idea import router as idea_router
# Import modular video endpoint routers
from app.api.v1.endpoints.video.luma import router as luma_router
from app.api.v1.endpoints.video.heygen import router as heygen_router
from app.api.v1.endpoints.styles import router as styles_router

# Create main API router for v1
api_router = APIRouter()

# Include all endpoint routers with their prefixes
api_router.include_router(idea_router, prefix="/idea", tags=["Idea Generation"])
# Include modular video endpoint routers with their respective prefixes
api_router.include_router(luma_router, prefix="/video/luma", tags=["Luma Video Generation"])
api_router.include_router(heygen_router, prefix="/video/heygen", tags=["HeyGen Video Generation"])
api_router.include_router(styles_router, prefix="/styles", tags=["Styles"]) 