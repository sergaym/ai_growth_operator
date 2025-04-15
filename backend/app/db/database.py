"""
Database configuration and utility functions.
"""

import logging
from typing import Optional, TypeVar, Type, Any, Generator

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

from app.core.config import settings

# Configure logging
logger = logging.getLogger(__name__)

# Check if database URL is set
if settings.DATABASE_URL is None:
    logger.warning("DATABASE_URL not set in environment. Database operations will be skipped.")
    SQLALCHEMY_DATABASE_URL = None
    ENABLE_DATABASE = False
else:
    SQLALCHEMY_DATABASE_URL = settings.DATABASE_URL
    ENABLE_DATABASE = True

