"""
Repository for Audio model operations.
"""

from typing import Dict, List, Optional, Any
from sqlalchemy.orm import Session


class AudioRepository:
    """Repository for Audio model operations."""
    
    def create(self, data: Dict[str, Any], db: Session) -> Any:
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
        db.commit()
        db.refresh(db_audio)
        return db_audio
    
    def get_by_id(self, audio_id: str, db: Session) -> Optional[Any]:
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
        
        return db.query(Audio).filter(Audio.id == audio_id).first()
        
    def get_all(
        self, 
        db: Session, 
        skip: int = 0, 
        limit: int = 100, 
        user_id: Optional[str] = None,
        workspace_id: Optional[str] = None,
        status: Optional[str] = None,
        sort_by: str = "created_at",
        sort_order: str = "desc"
    ) -> List[Any]:
        """
        Get all audio records with optional filtering and pagination.
        
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
        from sqlalchemy import desc, asc
        
        # Start with base query
        query = db.query(Audio)
        
        # Apply filters if provided
        if user_id:
            query = query.filter(Audio.user_id == user_id)
        if workspace_id:
            query = query.filter(Audio.workspace_id == workspace_id)
        if status:
            query = query.filter(Audio.status == status)
        
        # Apply sorting
        if hasattr(Audio, sort_by):
            sort_func = desc if sort_order.lower() == 'desc' else asc
            query = query.order_by(sort_func(getattr(Audio, sort_by)))
        
        # Apply pagination
        query = query.offset(skip).limit(limit)
        
        return query.all()
        
    def count(
        self, 
        db: Session, 
        user_id: Optional[str] = None,
        workspace_id: Optional[str] = None,
        status: Optional[str] = None
    ) -> int:
        """
        Count audio records with optional filtering.
        
        Args:
            db: Database session
            user_id: Filter by user ID
            workspace_id: Filter by workspace ID
            status: Filter by status
            
        Returns:
            Total count of audio records matching the filters
        """
        # Import here to avoid circular import
        from app.models import Audio
        
        # Start with base query
        query = db.query(Audio)
        
        # Apply filters if provided
        if user_id:
            query = query.filter(Audio.user_id == user_id)
        if workspace_id:
            query = query.filter(Audio.workspace_id == workspace_id)
        if status:
            query = query.filter(Audio.status == status)
        
        return query.count()


# Create an instance of the repository
audio_repository = AudioRepository() 