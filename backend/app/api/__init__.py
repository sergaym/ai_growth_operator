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
api_router.include_router(api_v0_router, prefix="/v0")
api_router.include_router(api_v1_router, prefix="/v1")

# For backward compatibility, also include v0 endpoints at the root level
# This allows existing clients to continue using the API without the /v0 prefix
api_router.include_router(api_v0_router)

# Note: We've removed the duplicate inclusion of v1 endpoints at the root level
# to maintain a clean, versioned API structure. 