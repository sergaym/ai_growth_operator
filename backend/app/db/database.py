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

def get_db() -> Generator[Session, None, None]:
    """
    Get a database session.
    
    Yields:
        Session: SQLAlchemy session
    """
    if not ENABLE_DATABASE:
        logger.warning("Database operations skipped: No database connection.")
        return None
        
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def save_to_db(db_object, session=None):
    """
    Save an object to the database if database is enabled.
    
    Args:
        db_object: SQLAlchemy model object to save
        session: Optional session to use (if None, a new session is created)
        
    Returns:
        The saved object, or None if database is disabled
    """
    if not ENABLE_DATABASE:
        logger.info("Database operation skipped: No database connection.")
        return None
    
    close_session = False
    if session is None:
        session = SessionLocal()
        close_session = True
    
    try:
        session.add(db_object)
        session.commit()
        session.refresh(db_object)
        return db_object
    except Exception as e:
        session.rollback()
        logger.error(f"Database error: {str(e)}")
        return None
    finally:
        if close_session:
            session.close()


def update_db_object(db_object, session=None):
    """
    Update an object in the database if database is enabled.
    
    Args:
        db_object: SQLAlchemy model object to update
        session: Optional session to use (if None, a new session is created)
        
    Returns:
        The updated object, or None if database is disabled
    """
    if not ENABLE_DATABASE:
        logger.info("Database operation skipped: No database connection.")
        return None
    
    close_session = False
    if session is None:
        session = SessionLocal()
        close_session = True
    
    try:
        session.commit()
        session.refresh(db_object)
        return db_object
    except Exception as e:
        session.rollback()
        logger.error(f"Database error: {str(e)}")
        return None
    finally:
        if close_session:
            session.close() 