"""
Lipsync API endpoints for synchronizing audio with video.
"""

import os
import base64
from typing import Dict, Any, Optional, List
from fastapi import APIRouter, HTTPException, BackgroundTasks, UploadFile, File, Form, Path, Query, Body, Depends
from pydantic import ValidationError
import logging

# Import schemas
from app.api.v1.schemas import (
    LipsyncRequest,
    LipsyncResponse,
    LipsyncDocumentationExample,
)

# Import services
from app.api.v1.services import lipsync_service

# Setup router
router = APIRouter()

# Setup logging
logger = logging.getLogger(__name__)
