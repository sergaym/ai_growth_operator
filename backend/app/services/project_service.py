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
    
    async def update_project(
        self,
        project_id: str,
        workspace_id: int,
        request: ProjectUpdateRequest,
        db: Session
    ) -> Optional[ProjectResponse]:
        """
        Update a project.
        
        Args:
            project_id: Project ID
            workspace_id: Workspace ID
            request: Update request
            db: Database session
            
        Returns:
            Updated project response or None if not found
        """
        try:
            project = db.query(Project).filter(
                and_(
                    Project.id == project_id,
                    Project.workspace_id == workspace_id
                )
            ).first()
            
            if not project:
                return None
            
            # Update fields
            if request.name is not None:
                project.name = request.name
            if request.description is not None:
                project.description = request.description
            if request.status is not None:
                project.status = request.status.value
            if request.thumbnail_url is not None:
                project.thumbnail_url = request.thumbnail_url
            if request.metadata is not None:
                project.metadata_json = request.metadata
            
            project.update_activity()
            
            db.commit()
            db.refresh(project)
            
            self.logger.info(f"Updated project {project_id}")
            
            return ProjectResponse.from_orm(project)
            
        except Exception as e:
            db.rollback()
            self.logger.error(f"Error updating project {project_id}: {str(e)}")
            raise
    
    async def delete_project(
        self,
        project_id: str,
        workspace_id: int,
        db: Session
    ) -> bool:
        """
        Delete a project and optionally its assets.
        
        Args:
            project_id: Project ID
            workspace_id: Workspace ID
            db: Database session
            
        Returns:
            True if deleted, False if not found
        """
        try:
            project = db.query(Project).filter(
                and_(
                    Project.id == project_id,
                    Project.workspace_id == workspace_id
                )
            ).first()
            
            if not project:
                return False
            
            # Note: We're not deleting associated assets by default
            # This could be a soft delete or provide option to cascade
            db.delete(project)
            db.commit()
            
            self.logger.info(f"Deleted project {project_id}")
            return True
            
        except Exception as e:
            db.rollback()
            self.logger.error(f"Error deleting project {project_id}: {str(e)}")
            raise
    
    async def get_project_assets(
        self,
        project_id: str,
        workspace_id: int,
        asset_type: Optional[str] = None,
        db: Session = None
    ) -> ProjectAssetsResponse:
        """
        Get all assets for a project.
        
        Args:
            project_id: Project ID
            workspace_id: Workspace ID
            asset_type: Filter by asset type (video, audio, image, lipsync_video)
            db: Database session
            
        Returns:
            Project assets response
        """
        try:
            if db is None:
                db = next(get_db())
            
            # Verify project exists and belongs to workspace
            project = db.query(Project).filter(
                and_(
                    Project.id == project_id,
                    Project.workspace_id == workspace_id
                )
            ).first()
            
            if not project:
                raise ValueError(f"Project {project_id} not found in workspace {workspace_id}")
            
            assets = []
            
            # Collect all asset types
            asset_queries = [
                (db.query(Image).filter(Image.project_id == project_id), "image"),
                (db.query(Video).filter(Video.project_id == project_id), "video"),
                (db.query(Audio).filter(Audio.project_id == project_id), "audio"),
                (db.query(LipsyncVideo).filter(LipsyncVideo.project_id == project_id), "lipsync_video"),
            ]
            
            for query, asset_type_name in asset_queries:
                if asset_type is None or asset_type == asset_type_name:
                    for asset in query.all():
                        asset_response = ProjectAssetResponse(
                            id=asset.id,
                            type=asset_type_name,
                            status=asset.status,
                            created_at=asset.created_at,
                            updated_at=asset.updated_at,
                            file_url=asset.file_url,
                            thumbnail_url=getattr(asset, 'preview_image_url', None),
                            metadata=asset.metadata_json
                        )
                        assets.append(asset_response)
            
            # Sort by creation date (newest first)
            assets.sort(key=lambda x: x.created_at, reverse=True)
            
            # Get asset summary
            asset_summary = await self._get_project_asset_summary(project_id, db)
            
            return ProjectAssetsResponse(
                assets=assets,
                total=len(assets),
                asset_summary=asset_summary
            )
            
        except Exception as e:
            self.logger.error(f"Error getting assets for project {project_id}: {str(e)}")
            raise
