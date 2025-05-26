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
    
    async def get_project(
        self, 
        project_id: str, 
        workspace_id: int,
        include_assets: bool = False,
        db: Session = None
    ) -> Optional[ProjectResponse]:
        """
        Get a project by ID within a workspace.
        
        Args:
            project_id: Project ID
            workspace_id: Workspace ID
            include_assets: Whether to include asset summary
            db: Database session
            
        Returns:
            Project response or None if not found
        """
        try:
            if db is None:
                db = next(get_db())
            
            query = db.query(Project).filter(
                and_(
                    Project.id == project_id,
                    Project.workspace_id == workspace_id
                )
            )
            
            project = query.first()
            if not project:
                return None
            
            project_response = ProjectResponse.from_orm(project)
            
            if include_assets:
                asset_summary = await self._get_project_asset_summary(project_id, db)
                project_response.asset_summary = asset_summary
            
            return project_response
            
        except Exception as e:
            self.logger.error(f"Error getting project {project_id}: {str(e)}")
            raise
    
    async def list_projects(
        self,
        workspace_id: int,
        page: int = 1,
        per_page: int = 20,
        status_filter: Optional[str] = None,
        search_query: Optional[str] = None,
        include_assets: bool = False,
        db: Session = None
    ) -> ProjectListResponse:
        """
        List projects in a workspace with pagination and filtering.
        
        Args:
            workspace_id: Workspace ID
            page: Page number (1-based)
            per_page: Number of projects per page
            status_filter: Filter by project status
            search_query: Search in project name and description
            include_assets: Whether to include asset summaries
            db: Database session
            
        Returns:
            Paginated list of projects
        """
        try:
            if db is None:
                db = next(get_db())
            
            # Build query
            query = db.query(Project).filter(Project.workspace_id == workspace_id)
            
            # Apply filters
            if status_filter:
                query = query.filter(Project.status == status_filter)
            
            if search_query:
                search_pattern = f"%{search_query}%"
                query = query.filter(
                    or_(
                        Project.name.ilike(search_pattern),
                        Project.description.ilike(search_pattern)
                    )
                )
            
            # Get total count
            total = query.count()
            
            # Apply pagination and ordering
            offset = (page - 1) * per_page
            projects = query.order_by(desc(Project.last_activity_at)).offset(offset).limit(per_page).all()
            
            # Convert to response objects
            project_responses = []
            for project in projects:
                project_response = ProjectResponse.from_orm(project)
                
                if include_assets:
                    asset_summary = await self._get_project_asset_summary(project.id, db)
                    project_response.asset_summary = asset_summary
                
                project_responses.append(project_response)
            
            total_pages = (total + per_page - 1) // per_page
            
            return ProjectListResponse(
                projects=project_responses,
                total=total,
                page=page,
                per_page=per_page,
                total_pages=total_pages
            )
            
        except Exception as e:
            self.logger.error(f"Error listing projects for workspace {workspace_id}: {str(e)}")
            raise
    
