"""
HeyGen video generation endpoints package (v0 legacy).

This package contains endpoints for HeyGen avatar video generation.
"""

from fastapi import APIRouter
from app.api.v0.endpoints.video.heygen.heygen import router as heygen_router

router = APIRouter()
router.include_router(heygen_router) 