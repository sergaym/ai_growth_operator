"""
API package for the AI Growth Operator.
This package contains all API versions and their endpoints.
"""

from fastapi import APIRouter

# Import version routers
from app.api.v0.api import api_router as api_v0_router
from app.api.v1.api import api_router as api_v1_router

# Create main API router
api_router = APIRouter()

# Include versioned routers
# api_router.include_router(api_v0_router, prefix="/v0")
api_router.include_router(api_v1_router, prefix="/v1")
