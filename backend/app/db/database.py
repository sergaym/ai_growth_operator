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

# Create engine and session maker if database is enabled
if ENABLE_DATABASE:
    try:
        engine = create_engine(
            SQLALCHEMY_DATABASE_URL,
            pool_pre_ping=True,
        )
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        logger.info(f"Database connection established to {SQLALCHEMY_DATABASE_URL.split('@')[-1] if '@' in SQLALCHEMY_DATABASE_URL else 'database'}")
    except Exception as e:
        logger.error(f"Failed to connect to database: {str(e)}")
        ENABLE_DATABASE = False

# Create Base class for declarative models
Base = declarative_base()
