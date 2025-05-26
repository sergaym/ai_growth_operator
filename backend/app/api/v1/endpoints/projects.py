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


