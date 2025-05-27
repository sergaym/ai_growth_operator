"""
Workspace projects endpoints.

Handles project management within workspaces including CRUD operations,
asset management, and project statistics.
"""

from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, Query, Path
from sqlalchemy.orm import Session
import logging

from app.api.v1.schemas import (
    ProjectCreateRequest,
    ProjectUpdateRequest,
    ProjectResponse,
    ProjectListResponse,
    ProjectAssetsResponse,
    ProjectStatsResponse,
)
from app.services.project_service import project_service
from app.services.workspace_service import WorkspaceService
from app.db.database import get_db
from app.core.security import get_current_user
from app.models import User

router = APIRouter()
logger = logging.getLogger(__name__)


def _check_workspace_access(db: Session, user_id: str, workspace_id: str):
    """Helper function to check workspace access."""
    if not WorkspaceService.user_has_access(db, user_id, workspace_id):
        raise HTTPException(status_code=403, detail="Not authorized to access this workspace")


# ============================================================================
# PROJECT CRUD OPERATIONS
# ============================================================================

@router.post(
    "/{workspace_id}/projects",
    response_model=ProjectResponse,
    tags=["Projects"],
    summary="Create a new project",
    description="Create a new project within a workspace."
)
async def create_project(
    workspace_id: str = Path(..., description="Workspace ID to create project in"),
    request: ProjectCreateRequest = ...,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new project in the specified workspace."""
    _check_workspace_access(db, current_user.id, workspace_id)
    
    try:
        project = await project_service.create_project(
            workspace_id=workspace_id,
            user_id=current_user.id,
            request=request,
            db=db
        )
        return project
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating project in workspace {workspace_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create project: {str(e)}")


