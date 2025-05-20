"""
Repository for LipsyncVideo model operations.
"""

from typing import Dict, List, Optional, Any
from sqlalchemy.orm import Session


class LipsyncVideoRepository:
    """Repository for LipsyncVideo model operations."""
    
    def create(self, data: Dict[str, Any], db: Session) -> Any:
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
        db.commit()
        db.refresh(db_lipsync)
        return db_lipsync
    
    def get_by_id(self, lipsync_id: str, db: Session) -> Optional[Any]:
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
        
        return db.query(LipsyncVideo).filter(LipsyncVideo.id == lipsync_id).first()
    
    def list_lipsync_videos(self, skip: int = 0, limit: int = 100, 
                           user_id: Optional[str] = None, 
                           workspace_id: Optional[str] = None, 
                           db: Session = None) -> List[Any]:
        """
        List lipsync videos with optional filtering.
        
        Args:
            skip: Number of records to skip
            limit: Maximum number of records to return
            user_id: Filter by user ID
            workspace_id: Filter by workspace ID
            db: Database session
            
        Returns:
            List of LipsyncVideo objects
        """
        # Import here to avoid circular import
        from app.models import LipsyncVideo
        
        query = db.query(LipsyncVideo)
        
        if user_id:
            query = query.filter(LipsyncVideo.user_id == user_id)
        
        if workspace_id:
            query = query.filter(LipsyncVideo.workspace_id == workspace_id)
        
        return query.order_by(LipsyncVideo.created_at.desc()).offset(skip).limit(limit).all()


# Create an instance of the repository
lipsync_repository = LipsyncVideoRepository() 