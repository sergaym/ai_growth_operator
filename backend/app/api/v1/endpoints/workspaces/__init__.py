"""
Workspaces API endpoints package.

This package contains all workspace-related endpoints organized by functionality:
- Core workspace operations (CRUD, users)
- Projects management
- Future: billing, settings, etc.
"""

from fastapi import APIRouter
from .core import router as core_router
from .projects import router as projects_router

# Create main workspaces router
router = APIRouter()

# Include sub-routers
router.include_router(core_router)
router.include_router(projects_router) 