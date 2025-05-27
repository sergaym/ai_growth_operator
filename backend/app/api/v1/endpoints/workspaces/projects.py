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
