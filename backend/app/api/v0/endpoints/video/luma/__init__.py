"""
Luma AI video generation endpoints package (v0 legacy).

This package contains endpoints for Luma AI video generation.
"""

from fastapi import APIRouter
from app.api.v0.endpoints.video.luma.luma import router as luma_router

router = APIRouter()
router.include_router(luma_router) 