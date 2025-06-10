"""
Repository for Audio model operations.
"""

from typing import Dict, List, Optional, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import desc, asc, select, func


class AudioRepository:
    """Repository for Audio model operations."""
    
    async def create(self, data: Dict[str, Any], db: AsyncSession) -> Any:
        """
        Create a new audio record in the database.
        
        Args:
            data: Dictionary containing audio data
            db: Database session
            
        Returns:
            Created Audio object
        """
        # Import here to avoid circular import
        from app.models import Audio
        
        db_audio = Audio(**data)
        db.add(db_audio)
        await db.commit()
        await db.refresh(db_audio)
        return db_audio
    
    async def get_by_id(self, audio_id: str, db: AsyncSession) -> Optional[Any]:
        """
        Get an audio by ID.
        
        Args:
            audio_id: ID of the audio to retrieve
            db: Database session
            
        Returns:
            Audio object or None if not found
        """
        # Import here to avoid circular import
        from app.models import Audio
        
        result = await db.execute(select(Audio).where(Audio.id == audio_id))
        return result.scalar_one_or_none()
        
    async def get_all(
        self, 
        db: AsyncSession, 
        skip: int = 0, 
        limit: int = 100, 
        user_id: Optional[str] = None,
        workspace_id: Optional[str] = None,
        status: Optional[str] = None,
        sort_by: str = "created_at",
        sort_order: str = "desc"
    ) -> List[Any]:
        """
        Get all audio with optional filtering and pagination.
        
        Args:
            db: Database session
            skip: Number of records to skip
            limit: Maximum number of records to return
            user_id: Filter by user ID
            workspace_id: Filter by workspace ID
            status: Filter by status
            sort_by: Field to sort by
            sort_order: Sort order ('asc' or 'desc')
            
        Returns:
            List of Audio objects
        """
        # Import here to avoid circular import
        from app.models import Audio
        
        # Start with base query
        query = select(Audio)
        
        # Apply filters if provided
        if user_id:
            query = query.where(Audio.user_id == user_id)
        if workspace_id:
            query = query.where(Audio.workspace_id == workspace_id)
        if status:
            query = query.where(Audio.status == status)
        
        # Apply sorting
        if hasattr(Audio, sort_by):
            sort_func = desc if sort_order.lower() == 'desc' else asc
            query = query.order_by(sort_func(getattr(Audio, sort_by)))
        
        # Apply pagination
        query = query.offset(skip).limit(limit)
        
        result = await db.execute(query)
        return result.scalars().all()
        
    async def count(
        self, 
        db: AsyncSession, 
        user_id: Optional[str] = None,
        workspace_id: Optional[str] = None,
        status: Optional[str] = None
    ) -> int:
        """
        Count audio with optional filtering.
        
        Args:
            db: Database session
            user_id: Filter by user ID
            workspace_id: Filter by workspace ID
            status: Filter by status
            
        Returns:
            Total count of audio matching the filters
        """
        # Import here to avoid circular import
        from app.models import Audio
        
        # Start with base query
        query = select(func.count(Audio.id))
        
        # Apply filters if provided
        if user_id:
            query = query.where(Audio.user_id == user_id)
        if workspace_id:
            query = query.where(Audio.workspace_id == workspace_id)
        if status:
            query = query.where(Audio.status == status)
        
        result = await db.execute(query)
        return result.scalar()


# Create an instance of the repository
audio_repository = AudioRepository() 