"""
Project schemas for API v1.
Defines request/response models for project management within workspaces.
"""

from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field
from enum import Enum
from datetime import datetime


class ProjectStatus(str, Enum):
    """Status of a project."""
    DRAFT = "draft"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    ARCHIVED = "archived"


class ProjectCreateRequest(BaseModel):
    """Request to create a new project."""
    name: str = Field(..., min_length=1, max_length=255, description="Project name")
    description: Optional[str] = Field(None, max_length=1000, description="Project description")
    thumbnail_url: Optional[str] = Field(None, description="Project thumbnail image URL")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional project metadata")


class ProjectUpdateRequest(BaseModel):
    """Request to update an existing project."""
    name: Optional[str] = Field(None, min_length=1, max_length=255, description="Project name")
    description: Optional[str] = Field(None, max_length=1000, description="Project description")
    status: Optional[ProjectStatus] = Field(None, description="Project status")
    thumbnail_url: Optional[str] = Field(None, description="Project thumbnail image URL")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional project metadata")


class ProjectAssetSummary(BaseModel):
    """Summary of assets within a project."""
    total_videos: int = Field(0, description="Total number of videos")
    total_audio: int = Field(0, description="Total number of audio files")
    total_images: int = Field(0, description="Total number of images")
    total_lipsync_videos: int = Field(0, description="Total number of lipsync videos")
    latest_asset_created_at: Optional[datetime] = Field(None, description="When the most recent asset was created")


class ProjectResponse(BaseModel):
    """Response model for a project."""
    id: str = Field(..., description="Project unique identifier")
    name: str = Field(..., description="Project name")
    description: Optional[str] = Field(None, description="Project description")
    workspace_id: str = Field(..., description="ID of the workspace this project belongs to")
    created_by_user_id: str = Field(..., description="ID of the user who created this project")
    status: ProjectStatus = Field(..., description="Current project status")
    thumbnail_url: Optional[str] = Field(None, description="Project thumbnail image URL")
    
    # Timestamps
    created_at: datetime = Field(..., description="When the project was created")
    updated_at: datetime = Field(..., description="When the project was last updated")
    last_activity_at: datetime = Field(..., description="When there was last activity in this project")
    
    # Asset summary (optional, only included when requested)
    asset_summary: Optional[ProjectAssetSummary] = Field(None, description="Summary of project assets")
    
    # Additional metadata
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional project metadata")

    class Config:
        from_attributes = True


class ProjectListResponse(BaseModel):
    """Response model for listing projects."""
    projects: List[ProjectResponse] = Field(..., description="List of projects")
    total: int = Field(..., description="Total number of projects")
    page: int = Field(..., description="Current page number")
    per_page: int = Field(..., description="Number of projects per page")
    total_pages: int = Field(..., description="Total number of pages")


class ProjectAssetResponse(BaseModel):
    """Response model for project assets."""
    id: str = Field(..., description="Asset unique identifier")
    type: str = Field(..., description="Asset type (video, audio, image, lipsync_video)")
    status: str = Field(..., description="Asset status")
    created_at: datetime = Field(..., description="When the asset was created")
    updated_at: datetime = Field(..., description="When the asset was last updated")
    file_url: Optional[str] = Field(None, description="Asset file URL")
    thumbnail_url: Optional[str] = Field(None, description="Asset thumbnail URL")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Asset metadata")


class ProjectAssetsResponse(BaseModel):
    """Response model for project assets list."""
    assets: List[ProjectAssetResponse] = Field(..., description="List of project assets")
    total: int = Field(..., description="Total number of assets")
    asset_summary: ProjectAssetSummary = Field(..., description="Summary of asset types")


class ProjectStatsResponse(BaseModel):
    """Response model for project statistics."""
    total_projects: int = Field(..., description="Total number of projects in workspace")
    projects_by_status: Dict[str, int] = Field(..., description="Count of projects by status")
    total_assets: int = Field(..., description="Total number of assets across all projects")
    recent_activity_count: int = Field(..., description="Number of projects with recent activity")
    most_active_projects: List[ProjectResponse] = Field(..., description="Projects with most recent activity")


