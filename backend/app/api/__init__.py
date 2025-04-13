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

# For backward compatibility, also include v1 endpoints at root level
# In a production environment, you might want to disable this eventually
api_router.include_router(api_v1_router) 