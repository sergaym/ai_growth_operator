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

