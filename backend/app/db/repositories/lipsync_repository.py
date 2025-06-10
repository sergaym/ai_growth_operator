"""
Repository for LipsyncVideo model operations.
"""

from typing import Dict, List, Optional, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import desc, asc, select, func


class LipsyncRepository:
    """Repository for LipsyncVideo model operations."""
    
    async def create(self, data: Dict[str, Any], db: AsyncSession) -> Any:
        """
        Create a new lipsync video record in the database.
        
        Args:
            data: Dictionary containing lipsync video data
            db: Database session
            
        Returns:
            Created LipsyncVideo object
        """
        # Import here to avoid circular import
        from app.models import LipsyncVideo
        
        db_lipsync = LipsyncVideo(**data)
        db.add(db_lipsync)
        await db.commit()
        await db.refresh(db_lipsync)
        return db_lipsync
    
    async def get_by_id(self, lipsync_id: str, db: AsyncSession) -> Optional[Any]:
        """
        Get a lipsync video by ID.
        
        Args:
            lipsync_id: ID of the lipsync video to retrieve
            db: Database session
            
        Returns:
            LipsyncVideo object or None if not found
        """
        # Import here to avoid circular import
        from app.models import LipsyncVideo
        
        result = await db.execute(select(LipsyncVideo).where(LipsyncVideo.id == lipsync_id))
        return result.scalar_one_or_none()
        
    async def get_all(
        self, 
        db: AsyncSession, 
        skip: int = 0, 
        limit: int = 100, 
        user_id: Optional[str] = None,
        workspace_id: Optional[str] = None,
        sort_by: str = "created_at",
        sort_order: str = "desc"
    ) -> List[Any]:
        """
        Get all lipsync videos with optional filtering and pagination.
        
        Args:
            db: Database session
            skip: Number of records to skip
            limit: Maximum number of records to return
            user_id: Filter by user ID
            workspace_id: Filter by workspace ID
            sort_by: Field to sort by
            sort_order: Sort order ('asc' or 'desc')
            
        Returns:
            List of LipsyncVideo objects
        """
        # Import here to avoid circular import
        from app.models import LipsyncVideo
        
        # Start with base query
        query = select(LipsyncVideo)
        
        # Apply filters if provided
        if user_id:
            query = query.where(LipsyncVideo.user_id == user_id)
        if workspace_id:
            query = query.where(LipsyncVideo.workspace_id == workspace_id)
        
        # Apply sorting
        if hasattr(LipsyncVideo, sort_by):
            sort_func = desc if sort_order.lower() == 'desc' else asc
            query = query.order_by(sort_func(getattr(LipsyncVideo, sort_by)))
        
        # Apply pagination
        query = query.offset(skip).limit(limit)
        
        result = await db.execute(query)
        return result.scalars().all()


# Create an instance of the repository
lipsync_repository = LipsyncRepository() 