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
        workspace_id: str,
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
        workspace_id: str,
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
        workspace_id: str,
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
        workspace_id: str,
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
        db: Session = None
    ) -> ProjectStatsResponse:
        """
        Get statistics for all projects in a workspace.
        
        Args:
            workspace_id: Workspace ID
            db: Database session
            
        Returns:
            Project statistics
        """
        try:
            if db is None:
                db = next(get_db())
            
            # Total projects
            total_projects = db.query(Project).filter(Project.workspace_id == workspace_id).count()
            
            # Projects by status
            status_counts = db.query(
                Project.status,
                func.count(Project.id)
            ).filter(
                Project.workspace_id == workspace_id
            ).group_by(Project.status).all()
            
            projects_by_status = {status: count for status, count in status_counts}
            
            # Total assets across all projects
            project_ids = [p.id for p in db.query(Project.id).filter(Project.workspace_id == workspace_id)]
            
            total_assets = 0
            if project_ids:
                total_assets += db.query(Video).filter(Video.project_id.in_(project_ids)).count()
                total_assets += db.query(Audio).filter(Audio.project_id.in_(project_ids)).count()
                total_assets += db.query(LipsyncVideo).filter(LipsyncVideo.project_id.in_(project_ids)).count()
            
            # Recent activity (last 7 days)
            week_ago = datetime.utcnow() - timedelta(days=7)
            recent_activity_count = db.query(Project).filter(
                and_(
                    Project.workspace_id == workspace_id,
                    Project.last_activity_at >= week_ago
                )
            ).count()
            
            # Most active projects (last 30 days)
            month_ago = datetime.utcnow() - timedelta(days=30)
            most_active_projects_orm = db.query(Project).filter(
                and_(
                    Project.workspace_id == workspace_id,
                    Project.last_activity_at >= month_ago
                )
            ).order_by(desc(Project.last_activity_at)).limit(5).all()
            
            most_active_projects = [ProjectResponse.from_orm(p) for p in most_active_projects_orm]
            
            return ProjectStatsResponse(
                total_projects=total_projects,
                projects_by_status=projects_by_status,
                total_assets=total_assets,
                recent_activity_count=recent_activity_count,
                most_active_projects=most_active_projects
            )
            
        except Exception as e:
            self.logger.error(f"Error getting workspace stats for {workspace_id}: {str(e)}")
            raise
    
    async def update_project_activity(
        self,
        project_id: str,
        db: Session
    ):
        """
        Update the last activity timestamp for a project.
        Called when assets are created/updated in the project.
        
        Args:
            project_id: Project ID
            db: Database session
        """
        try:
            project = db.query(Project).filter(Project.id == project_id).first()
            if project:
                project.update_activity()
                db.commit()
                self.logger.debug(f"Updated activity for project {project_id}")
        except Exception as e:
            self.logger.error(f"Error updating project activity {project_id}: {str(e)}")
    
    def _get_optimized_asset_url(self, asset, asset_type: str) -> Optional[str]:
        """
        Get the optimized asset URL prioritizing blob storage over external URLs.
        
        Args:
            asset: Database asset object
            asset_type: Type of asset (video, audio, lipsync_video)
            
        Returns:
            Optimized URL preferring blob storage
        """
        try:
            # Priority 1: Use blob_url if available (our storage)
            if hasattr(asset, 'blob_url') and asset.blob_url:
                self.logger.debug(f"✅ Using blob_url for {asset_type} asset {asset.id}: {asset.blob_url}")
                return asset.blob_url
            
            # Priority 2: Extract blob URL from metadata for different asset types
            if asset.metadata_json:
                metadata = asset.metadata_json
                
                # For lipsync videos
                if asset_type == 'lipsync_video':
                    # Check for video_url in metadata (should be blob storage)
                    if metadata.get('video_url') and 'vercel-storage.com' in str(metadata.get('video_url')):
                        self.logger.debug(f"✅ Using metadata.video_url (blob) for lipsync {asset.id}: {metadata['video_url']}")
                        return metadata['video_url']
                    
                    # Check for blob_url in metadata
                    elif metadata.get('blob_url'):
                        self.logger.debug(f"✅ Using metadata.blob_url for lipsync {asset.id}: {metadata['blob_url']}")
                        return metadata['blob_url']
                
                # For audio assets
                elif asset_type == 'audio':
                    # Check for audio_url in metadata (should be blob storage)
                    if metadata.get('audio_url') and 'vercel-storage.com' in str(metadata.get('audio_url')):
                        self.logger.debug(f"✅ Using metadata.audio_url (blob) for audio {asset.id}: {metadata['audio_url']}")
                        return metadata['audio_url']
                    
                    # Check for blob_url in metadata
                    elif metadata.get('blob_url'):
                        self.logger.debug(f"✅ Using metadata.blob_url for audio {asset.id}: {metadata['blob_url']}")
                        return metadata['blob_url']
                
                # For video assets
                elif asset_type == 'video':
                    # Check for video_url in metadata (should be blob storage)
                    if metadata.get('video_url') and 'vercel-storage.com' in str(metadata.get('video_url')):
                        self.logger.debug(f"✅ Using metadata.video_url (blob) for video {asset.id}: {metadata['video_url']}")
                        return metadata['video_url']
                    
                    # Check for blob_url in metadata
                    elif metadata.get('blob_url'):
                        self.logger.debug(f"✅ Using metadata.blob_url for video {asset.id}: {metadata['blob_url']}")
                        return metadata['blob_url']
                
                # Generic fallbacks for any asset type
                # Check nested result structures
                result = metadata.get('result', {})
                if isinstance(result, dict):
                    # Check result.video.url for lipsync/video assets
                    if asset_type in ['video', 'lipsync_video'] and result.get('video', {}).get('url'):
                        url = result['video']['url']
                        # Only use external URLs as last resort
                        if 'vercel-storage.com' in str(url):
                            self.logger.debug(f"✅ Using result.video.url (blob) for {asset_type} {asset.id}: {url}")
                            return url
                    
                    # Check result.audio_url for audio assets
                    elif asset_type == 'audio' and result.get('audio_url'):
                        url = result['audio_url']
                        if 'vercel-storage.com' in str(url):
                            self.logger.debug(f"✅ Using result.audio_url (blob) for audio {asset.id}: {url}")
                            return url
            
            # Priority 3: Use file_url if it's a blob storage URL
            if asset.file_url and 'vercel-storage.com' in str(asset.file_url):
                self.logger.debug(f"✅ Using file_url (blob) for {asset_type} asset {asset.id}: {asset.file_url}")
                return asset.file_url
            
            # Priority 4: Fallback to original file_url (external URL)
            if asset.file_url:
                self.logger.warning(f"⚠️ Using external file_url for {asset_type} asset {asset.id}: {asset.file_url}")
                return asset.file_url
            
            # No URL found
            self.logger.warning(f"❌ No URL found for {asset_type} asset {asset.id}")
            return None
            
        except Exception as e:
            self.logger.error(f"Error optimizing URL for {asset_type} asset {asset.id}: {str(e)}")
            # Fallback to original file_url
            return getattr(asset, 'file_url', None)
    
    def _get_optimized_thumbnail_url(self, asset, asset_type: str) -> Optional[str]:
        """
        Get the optimized thumbnail URL prioritizing blob storage.
        
        Args:
            asset: Database asset object
            asset_type: Type of asset
            
        Returns:
            Optimized thumbnail URL
        """
        try:
            # Priority 1: Check for thumbnail_blob_url
            if hasattr(asset, 'thumbnail_blob_url') and asset.thumbnail_blob_url:
                return asset.thumbnail_blob_url
            
            # Priority 2: Check metadata for thumbnail URLs
            if asset.metadata_json:
                metadata = asset.metadata_json
                
                # Check for thumbnail_url in metadata
                if metadata.get('thumbnail_url'):
                    return metadata['thumbnail_url']
                
                # Check nested result for thumbnail
                result = metadata.get('result', {})
                if isinstance(result, dict) and result.get('thumbnail_url'):
                    return result['thumbnail_url']
            
            # Priority 3: Use preview_image_url (legacy field)
            if hasattr(asset, 'preview_image_url') and asset.preview_image_url:
                return asset.preview_image_url
            
            # Priority 4: Use thumbnail_url field if exists
            if hasattr(asset, 'thumbnail_url') and asset.thumbnail_url:
                return asset.thumbnail_url
            
            return None
            
        except Exception as e:
            self.logger.error(f"Error optimizing thumbnail URL for {asset_type} asset {asset.id}: {str(e)}")
            return getattr(asset, 'preview_image_url', None)
    
    async def _get_project_asset_summary(
        self,
        project_id: str,
        db: Session
    ) -> ProjectAssetSummary:
        """
        Get asset summary for a project.
        
        Args:
            project_id: Project ID
            db: Database session
            
        Returns:
            Asset summary
        """
        try:
            # Count each asset type
            total_videos = db.query(Video).filter(Video.project_id == project_id).count()
            total_audio = db.query(Audio).filter(Audio.project_id == project_id).count()
            total_lipsync_videos = db.query(LipsyncVideo).filter(LipsyncVideo.project_id == project_id).count()
            
            # Find latest asset creation time
            latest_times = []
            
            if total_videos > 0:
                latest_video = db.query(func.max(Video.created_at)).filter(Video.project_id == project_id).scalar()
                if latest_video:
                    latest_times.append(latest_video)
            
            if total_audio > 0:
                latest_audio = db.query(func.max(Audio.created_at)).filter(Audio.project_id == project_id).scalar()
                if latest_audio:
                    latest_times.append(latest_audio)
            
            if total_lipsync_videos > 0:
                latest_lipsync = db.query(func.max(LipsyncVideo.created_at)).filter(LipsyncVideo.project_id == project_id).scalar()
                if latest_lipsync:
                    latest_times.append(latest_lipsync)
            
            latest_asset_created_at = max(latest_times) if latest_times else None
            
            return ProjectAssetSummary(
                total_videos=total_videos,
                total_audio=total_audio,
                total_images=0,  # Projects should not have images
                total_lipsync_videos=total_lipsync_videos,
                latest_asset_created_at=latest_asset_created_at
            )
            
        except Exception as e:
            self.logger.error(f"Error getting asset summary for project {project_id}: {str(e)}")
            return ProjectAssetSummary()


# Global service instance
project_service = ProjectService() 