"""
Project Service for managing projects within workspaces.
Handles CRUD operations, asset management, and statistics.
"""

import logging
from typing import List, Optional, Dict, Any, Tuple
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import desc, func, and_, or_, select

from app.models import Project, Workspace, User, Video, Audio, LipsyncVideo
from app.api.v1.schemas import (
    ProjectCreateRequest,
    ProjectUpdateRequest,
    ProjectResponse,
    ProjectListResponse,
    ProjectAssetSummary,
    ProjectAssetResponse,
    ProjectAssetsResponse,
    ProjectStatsResponse,
    ProjectStatus
)

logger = logging.getLogger(__name__)


class ProjectService:
    """Service for managing projects within workspaces."""
    
    def __init__(self):
        self.logger = logger
        
    async def create_project(
        self, 
        workspace_id: str,
        user_id: str, 
        request: ProjectCreateRequest,
        db: AsyncSession
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
            # Verify workspace exists
            workspace_result = await db.execute(
                select(Workspace).where(Workspace.id == workspace_id)
            )
            workspace = workspace_result.scalar_one_or_none()
            if not workspace:
                raise ValueError(f"Workspace {workspace_id} not found")
            
            # Verify user exists
            user_result = await db.execute(
                select(User).where(User.id == user_id)
            )
            user = user_result.scalar_one_or_none()
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
            await db.commit()
            await db.refresh(project)
            
            self.logger.info(f"Created project {project.id} in workspace {workspace_id}")
            
            return ProjectResponse.from_orm(project)
            
        except Exception as e:
            await db.rollback()
            self.logger.error(f"Error creating project: {str(e)}")
            raise
    
    async def get_project(
        self, 
        project_id: str, 
        workspace_id: str,
        include_assets: bool = False,
        db: AsyncSession = None
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
                raise ValueError("Database session is required")
            
            result = await db.execute(
                select(Project).where(
                    and_(
                        Project.id == project_id,
                        Project.workspace_id == workspace_id
                    )
                )
            )
            
            project = result.scalar_one_or_none()
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
        workspace_id: str,
        page: int = 1,
        per_page: int = 20,
        status_filter: Optional[str] = None,
        search_query: Optional[str] = None,
        include_assets: bool = False,
        db: AsyncSession = None
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
                raise ValueError("Database session is required")
            
            # Build base query
            query = select(Project).where(Project.workspace_id == workspace_id)
            
            # Apply filters
            if status_filter:
                query = query.where(Project.status == status_filter)
            
            if search_query:
                search_pattern = f"%{search_query}%"
                query = query.where(
                    or_(
                        Project.name.ilike(search_pattern),
                        Project.description.ilike(search_pattern)
                    )
                )
            
            # Get total count
            count_query = select(func.count()).select_from(
                query.subquery()
            )
            total_result = await db.execute(count_query)
            total = total_result.scalar()
            
            # Apply pagination and ordering
            offset = (page - 1) * per_page
            projects_query = query.order_by(desc(Project.last_activity_at)).offset(offset).limit(per_page)
            
            result = await db.execute(projects_query)
            projects = result.scalars().all()
            
            # Convert to response objects
            project_responses = []
            for project in projects:
                project_response = ProjectResponse.from_orm(project)
                
                if include_assets:
                    asset_summary = await self._get_project_asset_summary(project.id, db)
                    project_response.asset_summary = asset_summary
                
                project_responses.append(project_response)
            
            # Calculate pagination
            import math
            total_pages = math.ceil(total / per_page) if total > 0 else 1
            
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
        workspace_id: str,
        request: ProjectUpdateRequest,
        db: AsyncSession
    ) -> Optional[ProjectResponse]:
        """
        Update a project's information.
        
        Args:
            project_id: Project ID
            workspace_id: Workspace ID
            request: Update request
            db: Database session
            
        Returns:
            Updated project response or None if not found
        """
        try:
            result = await db.execute(
                select(Project).where(
                    and_(
                        Project.id == project_id,
                        Project.workspace_id == workspace_id
                    )
                )
            )
            project = result.scalar_one_or_none()
            
            if not project:
                return None
            
            # Update fields that are provided
            if request.name is not None:
                project.name = request.name
            if request.description is not None:
                project.description = request.description
            if request.status is not None:
                project.status = request.status
            if request.thumbnail_url is not None:
                project.thumbnail_url = request.thumbnail_url
            if request.metadata is not None:
                project.metadata_json = request.metadata
            
            # Update last activity
            project.last_activity_at = datetime.utcnow()
            
            await db.commit()
            await db.refresh(project)
            
            self.logger.info(f"Updated project {project_id}")
            
            return ProjectResponse.from_orm(project)
            
        except Exception as e:
            await db.rollback()
            self.logger.error(f"Error updating project {project_id}: {str(e)}")
            raise
    
    async def delete_project(
        self,
        project_id: str,
        workspace_id: str,
        db: AsyncSession
    ) -> bool:
        """
        Delete a project from the workspace.
        
        Args:
            project_id: Project ID
            workspace_id: Workspace ID
            db: Database session
            
        Returns:
            True if deleted, False if not found
        """
        try:
            result = await db.execute(
                select(Project).where(
                    and_(
                        Project.id == project_id,
                        Project.workspace_id == workspace_id
                    )
                )
            )
            project = result.scalar_one_or_none()
            
            if not project:
                return False
            
            await db.delete(project)
            await db.commit()
            
            self.logger.info(f"Deleted project {project_id}")
            
            return True
            
        except Exception as e:
            await db.rollback()
            self.logger.error(f"Error deleting project {project_id}: {str(e)}")
            raise
    
    async def get_project_assets(
        self,
        project_id: str,
        workspace_id: str,
        asset_type: Optional[str] = None,
        db: Session = None
    ) -> ProjectAssetsResponse:
        """
        Get all assets for a project.
        
        Args:
            project_id: Project ID
            workspace_id: Workspace ID
            asset_type: Filter by asset type (video, audio, lipsync_video)
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
                (db.query(Video).filter(Video.project_id == project_id), "video"),
                (db.query(Audio).filter(Audio.project_id == project_id), "audio"),
                (db.query(LipsyncVideo).filter(LipsyncVideo.project_id == project_id), "lipsync_video"),
            ]
            
            for query, asset_type_name in asset_queries:
                if asset_type is None or asset_type == asset_type_name:
                    for asset in query.all():
                        # Enhanced URL prioritization logic for consistent blob storage URLs
                        optimized_file_url = self._get_optimized_asset_url(asset, asset_type_name)
                        optimized_thumbnail_url = self._get_optimized_thumbnail_url(asset, asset_type_name)
                        
                        asset_response = ProjectAssetResponse(
                            id=asset.id,
                            type=asset_type_name,
                            status=asset.status,
                            created_at=asset.created_at,
                            updated_at=asset.updated_at,
                            file_url=optimized_file_url,
                            thumbnail_url=optimized_thumbnail_url,
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
    
    async def get_workspace_stats(
        self,
        workspace_id: str,
        db: AsyncSession = None
    ) -> ProjectStatsResponse:
        """
        Get statistics for projects in a workspace.
        
        Args:
            workspace_id: Workspace ID
            db: Database session
            
        Returns:
            Project statistics response
        """
        try:
            if db is None:
                raise ValueError("Database session is required")
            
            # Get total projects
            total_result = await db.execute(
                select(func.count(Project.id)).where(Project.workspace_id == workspace_id)
            )
            total_projects = total_result.scalar()
            
            # Get status counts
            status_result = await db.execute(
                select(Project.status, func.count(Project.id))
                .where(Project.workspace_id == workspace_id)
                .group_by(Project.status)
            )
            status_counts = dict(status_result.all())
            
            # Get project IDs for asset counting
            project_ids_result = await db.execute(
                select(Project.id).where(Project.workspace_id == workspace_id)
            )
            project_ids = [row[0] for row in project_ids_result.all()]
            
            # Get total assets
            total_assets = 0
            if project_ids:
                video_count_result = await db.execute(
                    select(func.count(Video.id)).where(Video.project_id.in_(project_ids))
                )
                total_assets += video_count_result.scalar()
                
                audio_count_result = await db.execute(
                    select(func.count(Audio.id)).where(Audio.project_id.in_(project_ids))
                )
                total_assets += audio_count_result.scalar()
                
                lipsync_count_result = await db.execute(
                    select(func.count(LipsyncVideo.id)).where(LipsyncVideo.project_id.in_(project_ids))
                )
                total_assets += lipsync_count_result.scalar()
            
            # Get recent activity (last 7 days)
            seven_days_ago = datetime.utcnow() - timedelta(days=7)
            recent_activity_result = await db.execute(
                select(func.count(Project.id))
                .where(
                    and_(
                        Project.workspace_id == workspace_id,
                        Project.last_activity_at >= seven_days_ago
                    )
                )
            )
            recent_activity_count = recent_activity_result.scalar()
            
            # Get most active projects
            most_active_result = await db.execute(
                select(Project)
                .where(Project.workspace_id == workspace_id)
                .order_by(desc(Project.last_activity_at))
                .limit(5)
            )
            most_active_projects_orm = most_active_result.scalars().all()
            
            most_active_projects = [
                ProjectResponse.from_orm(project) for project in most_active_projects_orm
            ]
            
            return ProjectStatsResponse(
                total_projects=total_projects,
                total_assets=total_assets,
                status_breakdown=status_counts,
                recent_activity_count=recent_activity_count,
                most_active_projects=most_active_projects
            )
            
        except Exception as e:
            self.logger.error(f"Error getting workspace stats for {workspace_id}: {str(e)}")
            raise
    
    async def update_project_activity(
        self,
        project_id: str,
        db: AsyncSession
    ):
        """
        Update the last activity timestamp for a project.
        
        Args:
            project_id: Project ID
            db: Database session
        """
        try:
            result = await db.execute(
                select(Project).where(Project.id == project_id)
            )
            project = result.scalar_one_or_none()
            
            if project:
                project.last_activity_at = datetime.utcnow()
                await db.commit()
                
        except Exception as e:
            self.logger.error(f"Error updating project activity for {project_id}: {str(e)}")
            await db.rollback()
    
    def _get_optimized_asset_url(self, asset, asset_type: str) -> Optional[str]:
        """
        Get the optimized URL for an asset based on CDN configuration.
        
        Args:
            asset: Asset object (Video, Audio, or LipsyncVideo)
            asset_type: Type of asset ("video", "audio", "lipsync_video")
            
        Returns:
            Optimized asset URL or None
        """
        try:
            # Check for CDN URL first
            if hasattr(asset, 'cdn_url') and asset.cdn_url:
                return asset.cdn_url
            
            # Fall back to S3 URL if available
            if hasattr(asset, 's3_url') and asset.s3_url:
                return asset.s3_url
            
            # Fall back to local file URL
            if hasattr(asset, 'local_file_path') and asset.local_file_path:
                # In production, this should be served through a proper file server
                return f"/files/{asset_type}/{asset.id}"
            
            return None
            
        except Exception as e:
            self.logger.warning(f"Error getting optimized URL for {asset_type} {asset.id}: {str(e)}")
            return None
    
    def _get_optimized_thumbnail_url(self, asset, asset_type: str) -> Optional[str]:
        """
        Get the optimized thumbnail URL for an asset.
        
        Args:
            asset: Asset object (Video, Audio, or LipsyncVideo)
            asset_type: Type of asset ("video", "audio", "lipsync_video")
            
        Returns:
            Optimized thumbnail URL or None
        """
        try:
            # Check for CDN thumbnail URL first
            if hasattr(asset, 'thumbnail_cdn_url') and asset.thumbnail_cdn_url:
                return asset.thumbnail_cdn_url
            
            # Fall back to S3 thumbnail URL
            if hasattr(asset, 'thumbnail_s3_url') and asset.thumbnail_s3_url:
                return asset.thumbnail_s3_url
            
            # Fall back to generated thumbnail URL
            if hasattr(asset, 'thumbnail_url') and asset.thumbnail_url:
                return asset.thumbnail_url
            
            # For audio files, return a default audio icon
            if asset_type == "audio":
                return "/static/icons/audio-file.png"
            
            return None
            
        except Exception as e:
            self.logger.warning(f"Error getting thumbnail URL for {asset_type} {asset.id}: {str(e)}")
            return None
    
    async def _get_project_asset_summary(
        self,
        project_id: str,
        db: AsyncSession
    ) -> ProjectAssetSummary:
        """
        Get a summary of assets for a project.
        
        Args:
            project_id: Project ID
            db: Database session
            
        Returns:
            Project asset summary
        """
        try:
            # Get counts
            video_count_result = await db.execute(
                select(func.count(Video.id)).where(Video.project_id == project_id)
            )
            total_videos = video_count_result.scalar()
            
            audio_count_result = await db.execute(
                select(func.count(Audio.id)).where(Audio.project_id == project_id)
            )
            total_audio = audio_count_result.scalar()
            
            lipsync_count_result = await db.execute(
                select(func.count(LipsyncVideo.id)).where(LipsyncVideo.project_id == project_id)
            )
            total_lipsync_videos = lipsync_count_result.scalar()
            
            # Get latest activity timestamps
            latest_activity = None
            
            latest_video_result = await db.execute(
                select(func.max(Video.created_at)).where(Video.project_id == project_id)
            )
            latest_video = latest_video_result.scalar()
            if latest_video:
                latest_activity = latest_video
            
            latest_audio_result = await db.execute(
                select(func.max(Audio.created_at)).where(Audio.project_id == project_id)
            )
            latest_audio = latest_audio_result.scalar()
            if latest_audio and (not latest_activity or latest_audio > latest_activity):
                latest_activity = latest_audio
            
            latest_lipsync_result = await db.execute(
                select(func.max(LipsyncVideo.created_at)).where(LipsyncVideo.project_id == project_id)
            )
            latest_lipsync = latest_lipsync_result.scalar()
            if latest_lipsync and (not latest_activity or latest_lipsync > latest_activity):
                latest_activity = latest_lipsync
            
            return ProjectAssetSummary(
                total_assets=total_videos + total_audio + total_lipsync_videos,
                video_count=total_videos,
                audio_count=total_audio,
                lipsync_video_count=total_lipsync_videos,
                latest_activity=latest_activity
            )
            
        except Exception as e:
            self.logger.error(f"Error getting asset summary for project {project_id}: {str(e)}")
            return ProjectAssetSummary(
                total_assets=0,
                video_count=0,
                audio_count=0,
                lipsync_video_count=0,
                latest_activity=None
            )


# Global instance
project_service = ProjectService() 