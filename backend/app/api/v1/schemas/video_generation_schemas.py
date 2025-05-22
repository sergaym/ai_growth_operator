"""
Video Generation Workflow schemas for API v1.
Defines request/response models for the complete video generation workflow
that orchestrates text-to-speech and lipsync operations.
"""

from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field
from enum import Enum

