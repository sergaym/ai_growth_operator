"""
Repository for Video model operations.
"""

from typing import Dict, List, Optional, Any
from sqlalchemy.orm import Session


class VideoRepository:
    """Repository for Video model operations."""
    
    def create(self, data: Dict[str, Any], db: Session) -> Any:
        """
        Create a new video record in the database.
        
        Args:
            data: Dictionary containing video data
            db: Database session
            
        Returns:
            Created Video object
        """
        # Import here to avoid circular import
        from app.models import Video
        
        db_video = Video(**data)
        db.add(db_video)
        db.commit()
        db.refresh(db_video)
        return db_video
    
    def get_by_id(self, video_id: str, db: Session) -> Optional[Any]:
        """
        Get a video by ID.
        
        Args:
            video_id: ID of the video to retrieve
            db: Database session
            
        Returns:
            Video object or None if not found
        """
        # Import here to avoid circular import
        from app.models import Video
        
        return db.query(Video).filter(Video.id == video_id).first()
        
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
        Get all videos with optional filtering and pagination.
        
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
            List of Video objects
        """
        # Import here to avoid circular import
        from app.models import Video
        from sqlalchemy import desc, asc
        
        # Start with base query
        query = db.query(Video)
        
        # Apply filters if provided
        if user_id:
            query = query.filter(Video.user_id == user_id)
        if workspace_id:
            query = query.filter(Video.workspace_id == workspace_id)
        if status:
            query = query.filter(Video.status == status)
        
        # Apply sorting
        if hasattr(Video, sort_by):
            sort_func = desc if sort_order.lower() == 'desc' else asc
            query = query.order_by(sort_func(getattr(Video, sort_by)))
        
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
        Count videos with optional filtering.
        
        Args:
            db: Database session
            user_id: Filter by user ID
            workspace_id: Filter by workspace ID
            status: Filter by status
            
        Returns:
            Total count of videos matching the filters
        """
        # Import here to avoid circular import
        from app.models import Video
        
        # Start with base query
        query = db.query(Video)
        
        # Apply filters if provided
        if user_id:
            query = query.filter(Video.user_id == user_id)
        if workspace_id:
            query = query.filter(Video.workspace_id == workspace_id)
        if status:
            query = query.filter(Video.status == status)
        
        return query.count()


# Create an instance of the repository
video_repository = VideoRepository() 