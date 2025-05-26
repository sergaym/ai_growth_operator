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

