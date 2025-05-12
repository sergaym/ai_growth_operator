"""
Video generation endpoints package (v0 legacy).

This package contains endpoints for different video generation services.
"""

from fastapi import APIRouter
from app.api.v0.endpoints.video.heygen import router as heygen_router
from app.api.v0.endpoints.video.luma import router as luma_router

router = APIRouter()

router.include_router(heygen_router, prefix="/heygen", tags=["heygen"])
router.include_router(luma_router, prefix="/luma", tags=["luma"]) 