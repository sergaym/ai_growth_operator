"""
Project endpoints for the AI Growth Operator API v1.
These endpoints handle project management within workspaces.
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
    ProjectDocumentationExample
)
from app.services.project_service import project_service
from app.db.database import get_db

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post(
    "/workspaces/{workspace_id}/projects",
    response_model=ProjectResponse,
    summary="Create a new project",
    description="""
    Create a new project within a workspace.
    
    Projects are used to organize video generation work, assets, and collaborate
    within a workspace. Each project tracks its status, assets, and activity.
    """
)
async def create_project(
    workspace_id: int = Path(..., description="Workspace ID to create project in"),
    request: ProjectCreateRequest = ...,
    user_id: int = Query(..., description="ID of the user creating the project"),
    db: Session = Depends(get_db)
):
    """
    Create a new project in the specified workspace.
    
    Args:
        workspace_id: ID of the workspace
        request: Project creation request
        user_id: ID of the user creating the project
        db: Database session
        
    Returns:
        Created project information
    """
    try:
        project = await project_service.create_project(
            workspace_id=workspace_id,
            user_id=user_id,
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
    "/workspaces/{workspace_id}/projects",
    response_model=ProjectListResponse,
    summary="List projects in workspace",
    description="""
    Get a paginated list of projects in the workspace.
    
    Supports filtering by status and searching by name/description.
    Projects are ordered by last activity (most recent first).
    """
)
async def list_projects(
    workspace_id: int = Path(..., description="Workspace ID to list projects from"),
    page: int = Query(1, ge=1, description="Page number (1-based)"),
    per_page: int = Query(20, ge=1, le=100, description="Number of projects per page"),
    status: Optional[str] = Query(None, description="Filter by project status"),
    search: Optional[str] = Query(None, description="Search in project name and description"),
    include_assets: bool = Query(False, description="Include asset summaries for each project"),
    db: Session = Depends(get_db)
):
    """
    List projects in a workspace with pagination and filtering.
    
    Args:
        workspace_id: Workspace ID
        page: Page number
        per_page: Projects per page
        status: Filter by status
        search: Search query
        include_assets: Include asset summaries
        db: Database session
        
    Returns:
        Paginated list of projects
    """
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
    "/workspaces/{workspace_id}/projects/{project_id}",
    response_model=ProjectResponse,
    summary="Get project details",
    description="""
    Get detailed information about a specific project.
    
    Optionally includes asset summary with counts and latest activity.
    """
)
async def get_project(
    workspace_id: int = Path(..., description="Workspace ID"),
    project_id: str = Path(..., description="Project ID"),
    include_assets: bool = Query(False, description="Include asset summary"),
    db: Session = Depends(get_db)
):
    """
    Get a project by ID.
    
    Args:
        workspace_id: Workspace ID
        project_id: Project ID
        include_assets: Include asset summary
        db: Database session
        
    Returns:
        Project information
    """
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


@router.put(
    "/workspaces/{workspace_id}/projects/{project_id}",
    response_model=ProjectResponse,
    summary="Update project",
    description="""
    Update project information including name, description, status, and metadata.
    
    Updating a project automatically updates its last activity timestamp.
    """
)
async def update_project(
    workspace_id: int = Path(..., description="Workspace ID"),
    project_id: str = Path(..., description="Project ID"),
    request: ProjectUpdateRequest = ...,
    db: Session = Depends(get_db)
):
    """
    Update a project.
    
    Args:
        workspace_id: Workspace ID
        project_id: Project ID
        request: Update request
        db: Database session
        
    Returns:
        Updated project information
    """
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
    "/workspaces/{workspace_id}/projects/{project_id}",
    summary="Delete project",
    description="""
    Delete a project from the workspace.
    
    Note: This does not delete associated assets by default.
    Assets will become unlinked from the project but remain in the system.
    """
)
async def delete_project(
    workspace_id: int = Path(..., description="Workspace ID"),
    project_id: str = Path(..., description="Project ID"),
    db: Session = Depends(get_db)
):
    """
    Delete a project.
    
    Args:
        workspace_id: Workspace ID
        project_id: Project ID
        db: Database session
        
    Returns:
        Success confirmation
    """
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


