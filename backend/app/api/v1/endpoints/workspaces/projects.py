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


@router.get(
    "/{workspace_id}/projects",
    response_model=ProjectListResponse,
    tags=["Projects"],
    summary="List projects in workspace",
    description="Get a paginated list of projects in the workspace."
)
async def list_projects(
    workspace_id: str = Path(..., description="Workspace ID to list projects from"),
    page: int = Query(1, ge=1, description="Page number (1-based)"),
    per_page: int = Query(20, ge=1, le=100, description="Number of projects per page"),
    status: Optional[str] = Query(None, description="Filter by project status"),
    search: Optional[str] = Query(None, description="Search in project name and description"),
    include_assets: bool = Query(False, description="Include asset summaries for each project"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List projects in a workspace with pagination and filtering."""
    _check_workspace_access(db, current_user.id, workspace_id)
    
    try:
        projects = await project_service.list_projects(
            workspace_id=workspace_id,
            page=page,
            per_page=per_page,
            status_filter=status,
            search_query=search,
            include_assets=include_assets,
            db=db
        )
        return projects
        
    except Exception as e:
        logger.error(f"Error listing projects for workspace {workspace_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to list projects: {str(e)}")


@router.get(
    "/{workspace_id}/projects/{project_id}",
    response_model=ProjectResponse,
    tags=["Projects"],
    summary="Get project details",
    description="Get detailed information about a specific project."
)
async def get_project(
    workspace_id: str = Path(..., description="Workspace ID"),
    project_id: str = Path(..., description="Project ID"),
    include_assets: bool = Query(False, description="Include asset summary"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a project by ID."""
    _check_workspace_access(db, current_user.id, workspace_id)
    
    try:
        project = await project_service.get_project(
            project_id=project_id,
            workspace_id=workspace_id,
            include_assets=include_assets,
            db=db
        )
        
        if not project:
            raise HTTPException(
                status_code=404, 
                detail=f"Project {project_id} not found in workspace {workspace_id}"
            )
        
        return project
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting project {project_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get project: {str(e)}")


@router.patch(
    "/{workspace_id}/projects/{project_id}",
    response_model=ProjectResponse,
    tags=["Projects"],
    summary="Update project details",
    description="Partially update project information including name, description, status, and metadata."
)
async def update_project_details(
    workspace_id: str = Path(..., description="Workspace ID"),
    project_id: str = Path(..., description="Project ID"),
    request: ProjectUpdateRequest = ...,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update project details using PATCH semantics for partial updates."""
    _check_workspace_access(db, current_user.id, workspace_id)
    
    try:
        project = await project_service.update_project(
            project_id=project_id,
            workspace_id=workspace_id,
            request=request,
            db=db
        )
        
        if not project:
            raise HTTPException(
                status_code=404,
                detail=f"Project {project_id} not found in workspace {workspace_id}"
            )
        
        return project
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating project {project_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update project: {str(e)}")


@router.delete(
    "/{workspace_id}/projects/{project_id}",
    tags=["Projects"],
    summary="Delete project",
    description="Delete a project from the workspace."
)
async def delete_project(
    workspace_id: str = Path(..., description="Workspace ID"),
    project_id: str = Path(..., description="Project ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a project."""
    _check_workspace_access(db, current_user.id, workspace_id)
    
    try:
        success = await project_service.delete_project(
            project_id=project_id,
            workspace_id=workspace_id,
            db=db
        )
        
        if not success:
            raise HTTPException(
                status_code=404,
                detail=f"Project {project_id} not found in workspace {workspace_id}"
            )
        
        return {"message": f"Project {project_id} deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting project {project_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete project: {str(e)}")


# ============================================================================
# PROJECT ASSETS & ANALYTICS
# ============================================================================

@router.get(
    "/{workspace_id}/projects/{project_id}/assets",
    response_model=ProjectAssetsResponse,
    tags=["Projects"],
    summary="Get project assets",
    description="Get all assets associated with a project."
)
async def get_project_assets(
    workspace_id: str = Path(..., description="Workspace ID"),
    project_id: str = Path(..., description="Project ID"),
    asset_type: Optional[str] = Query(
        None, 
        description="Filter by asset type (video, audio, lipsync_video)"
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all assets for a project."""
    _check_workspace_access(db, current_user.id, workspace_id)
    
    try:
        assets = await project_service.get_project_assets(
            project_id=project_id,
            workspace_id=workspace_id,
            asset_type=asset_type,
            db=db
        )
        return assets
        
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error getting assets for project {project_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get project assets: {str(e)}")


@router.get(
    "/{workspace_id}/projects/stats",
    response_model=ProjectStatsResponse,
    tags=["Projects"],
    summary="Get workspace project statistics",
    description="Get statistics about all projects in the workspace."
)
async def get_workspace_project_stats(
    workspace_id: str = Path(..., description="Workspace ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get project statistics for a workspace."""
    _check_workspace_access(db, current_user.id, workspace_id)
    
    try:
        stats = await project_service.get_workspace_stats(
            workspace_id=workspace_id,
            db=db
        )
        return stats
        
    except Exception as e:
        logger.error(f"Error getting workspace stats for {workspace_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get workspace stats: {str(e)}") 