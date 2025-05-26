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

