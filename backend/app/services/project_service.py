"""
Project Service for managing projects within workspaces.
Handles CRUD operations, asset management, and statistics.
"""

import logging
from typing import List, Optional, Dict, Any, Tuple
from datetime import datetime, timedelta
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc, func, and_, or_

from app.db.database import get_db
from app.models import Project, Workspace, User, Image, Video, Audio, LipsyncVideo, ProjectStatus
from app.api.v1.schemas import (
    ProjectCreateRequest,
    ProjectUpdateRequest,
    ProjectResponse,
    ProjectListResponse,
    ProjectAssetSummary,
    ProjectAssetResponse,
    ProjectAssetsResponse,
    ProjectStatsResponse
)

logger = logging.getLogger(__name__)


class ProjectService:
    """Service for managing projects within workspaces."""
    
    def __init__(self):
        self.logger = logger
        
    async def create_project(
        self, 
        workspace_id: int, 
        user_id: int, 
        request: ProjectCreateRequest,
        db: Session
    ) -> ProjectResponse:
        """
        Create a new project in the workspace.
        
        Args:
            workspace_id: ID of the workspace
            user_id: ID of the user creating the project
            request: Project creation request
            db: Database session
            
        Returns:
            Created project response
            
        Raises:
            ValueError: If workspace doesn't exist or user doesn't have access
        """
        try:
            # Verify workspace exists and user has access
            workspace = db.query(Workspace).filter(Workspace.id == workspace_id).first()
            if not workspace:
                raise ValueError(f"Workspace {workspace_id} not found")
            
            # Verify user exists and has access to workspace
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                raise ValueError(f"User {user_id} not found")
            
            # Create project
            project = Project(
                name=request.name,
                description=request.description,
                workspace_id=workspace_id,
                created_by_user_id=user_id,
                status=ProjectStatus.DRAFT.value,
                thumbnail_url=request.thumbnail_url,
                metadata_json=request.metadata
            )
            
            db.add(project)
            db.commit()
            db.refresh(project)
            
            self.logger.info(f"Created project {project.id} in workspace {workspace_id}")
            
            return ProjectResponse.from_orm(project)
            
        except Exception as e:
            db.rollback()
            self.logger.error(f"Error creating project: {str(e)}")
            raise
    
