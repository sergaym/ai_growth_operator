"""
API package for the AI Growth Operator.
This package contains all API versions and their endpoints.
"""

from fastapi import APIRouter

# Import version routers
from app.api.v1.api import api_router as api_v1_router

# Create main API router
api_router = APIRouter()

# Include versioned routers
api_router.include_router(api_v1_router, prefix="/v1")

# Note: We've removed the duplicate inclusion of v1 endpoints at the root level
# to maintain a clean, versioned API structure. 