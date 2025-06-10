"""
Async database configuration layer.
Optimized for PostgreSQL with asyncpg driver and production-grade connection pooling.
"""

import logging
import re
import time
from contextlib import asynccontextmanager
from typing import Optional, AsyncGenerator

from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.exc import SQLAlchemyError

from app.core.config import settings

# Configure logging
logger = logging.getLogger(__name__)

# ============================================================================
# DATABASE CONFIGURATION
# ============================================================================

DATABASE_URL = settings.DATABASE_URL
ENABLE_DATABASE = DATABASE_URL is not None

def _convert_to_asyncpg_url(url: str) -> str:
    """Convert database URL to asyncpg-compatible format with SSL handling."""
    if not url:
        return url
    
    # Convert to asyncpg format
    if url.startswith("postgresql://"):
        url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
    elif url.startswith("postgresql+psycopg2://"):
        url = url.replace("postgresql+psycopg2://", "postgresql+asyncpg://", 1)
        logger.warning("Legacy psycopg2 URL detected. Update to postgresql+asyncpg://")
    elif not url.startswith("postgresql+asyncpg://"):
        logger.warning(f"Unexpected database URL format: {url[:20]}...")
    
    # Handle SSL parameter conversion (psycopg2 → asyncpg)
    if "sslmode=" in url:
        ssl_map = {
            "sslmode=require": "ssl=require",
            "sslmode=disable": "ssl=disable",
            "sslmode=prefer": "ssl=prefer",
            "sslmode=allow": "ssl=prefer",
            "sslmode=verify-ca": "ssl=require",
            "sslmode=verify-full": "ssl=require"
        }
        
        for old, new in ssl_map.items():
            if old in url:
                url = url.replace(old, new)
                break
        else:
            # Remove unrecognized SSL modes
            url = re.sub(r'[?&]sslmode=[^&]*', '', url)
            url = re.sub(r'sslmode=[^&]*[&]?', '', url)
    
    return url

# Database URL setup
async_database_url = _convert_to_asyncpg_url(DATABASE_URL) if ENABLE_DATABASE else None

# Production engine configuration
ENGINE_CONFIG = {
    "pool_size": 20,              # Core connections
    "max_overflow": 0,            # No overflow for predictable performance
    "pool_pre_ping": True,        # Test connections before use
    "pool_recycle": 3600,         # Refresh connections hourly
    "pool_timeout": 30,           # Connection timeout
    "echo": False,                # Disable SQL logging in production
    "future": True,               # SQLAlchemy 2.0+ compatibility
}

# Global database objects
engine = None
SessionLocal = None

# Initialize database
if ENABLE_DATABASE:
    try:
        engine = create_async_engine(async_database_url, **ENGINE_CONFIG)
        SessionLocal = async_sessionmaker(
            bind=engine,
            class_=AsyncSession,
            autocommit=False,
            autoflush=False,
            expire_on_commit=False
        )
        
        # Log successful initialization
        safe_url = DATABASE_URL.split('@')[-1] if '@' in DATABASE_URL else 'local'
        logger.info(f"Database initialized: {safe_url}")
        
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        ENABLE_DATABASE = False
        engine = None
        SessionLocal = None
else:
    logger.warning("DATABASE_URL not configured - database disabled")

# Declarative base for ORM models
Base = declarative_base()

# ============================================================================
# DEPENDENCY INJECTION
# ============================================================================

async def get_db() -> AsyncGenerator[Optional[AsyncSession], None]:
    """
    FastAPI dependency for database sessions.
    
    Yields:
        AsyncSession or None if database disabled
    """
    if not ENABLE_DATABASE or not SessionLocal:
        yield None
        return
        
    async with SessionLocal() as session:
        try:
            yield session
        except SQLAlchemyError as e:
            logger.error(f"Database session error: {e}")
            await session.rollback()
            raise

# Alias for async sessions (better naming)
get_async_db = get_db

@asynccontextmanager
async def get_session() -> AsyncGenerator[Optional[AsyncSession], None]:
    """
    Context manager for database sessions with auto-commit.
    
    Yields:
        AsyncSession or None if database disabled
    """
    if not ENABLE_DATABASE or not SessionLocal:
        yield None
        return
        
    async with SessionLocal() as session:
        try:
            yield session
            await session.commit()
        except SQLAlchemyError as e:
            logger.error(f"Database transaction error: {e}")
            await session.rollback()
            raise

# ============================================================================
# DATABASE OPERATIONS
# ============================================================================

async def save_to_db(obj, session: Optional[AsyncSession] = None):
    """
    Save object to database.
    
    Args:
        obj: SQLAlchemy model instance
        session: Optional session to use
        
    Returns:
        Saved object or None if database disabled
    """
    if not ENABLE_DATABASE:
        return None
    
    if session:
        session.add(obj)
        await session.flush()
        await session.refresh(obj)
        return obj
    else:
        async with get_session() as session:
            if session:
                session.add(obj)
                await session.flush()
                await session.refresh(obj)
                return obj
    return None

async def update_db_object(obj, session: Optional[AsyncSession] = None):
    """
    Update object in database.
    
    Args:
        obj: SQLAlchemy model instance
        session: Optional session to use
        
    Returns:
        Updated object or None if database disabled
    """
    if not ENABLE_DATABASE:
        return None
    
    if session:
        await session.flush()
        await session.refresh(obj)
        return obj
    else:
        async with get_session() as session:
            if session:
                merged = await session.merge(obj)
                await session.refresh(merged)
                return merged
    return None

# ============================================================================
# HEALTH & MONITORING
# ============================================================================

async def check_database_health() -> dict:
    """Check database health with connection pool metrics."""
    if not ENABLE_DATABASE or not engine:
        return {
            "status": "disabled",
            "message": "Database not configured",
            "timestamp": time.time()
        }
    
    try:
        start = time.time()
        
        async with SessionLocal() as session:
            await session.execute(text("SELECT 1"))
            
        response_time = round((time.time() - start) * 1000, 2)
        pool = engine.pool
        
        return {
            "status": "healthy",
            "response_time_ms": response_time,
            "pool_size": pool.size(),
            "checked_out": pool.checkedout(),
            "overflow": pool.overflow(),
            "invalid": pool.invalid(),
            "timestamp": time.time()
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": time.time()
        }

async def get_engine_info() -> dict:
    """Get database engine information."""
    if not ENABLE_DATABASE or not engine:
        return {"status": "disabled"}
    
    pool = engine.pool
    return {
        "status": "active",
        "url": engine.url.render_as_string(hide_password=True),
        "driver": "asyncpg",
        "pool_size": pool.size(),
        "checked_out": pool.checkedout(),
        "overflow": pool.overflow(),
        "invalid": pool.invalid()
    }

# ============================================================================
# LIFECYCLE MANAGEMENT
# ============================================================================

async def close_database_engine():
    """Gracefully close database engine and all connections."""
    if engine:
        await engine.dispose()
        logger.info("Database engine closed")

# ============================================================================
# EXPORTS
# ============================================================================

__all__ = [
    "Base",
    "get_db", 
    "get_async_db",
    "get_session",
    "save_to_db",
    "update_db_object", 
    "check_database_health",
    "get_engine_info",
    "close_database_engine",
    "ENABLE_DATABASE"
] 