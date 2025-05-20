"""
Repository for Image model operations.
"""

from typing import Dict, List, Optional, Any
from sqlalchemy.orm import Session


class ImageRepository:
    """Repository for Image model operations."""

    def create(self, data: Dict[str, Any], db: Session) -> Any:
        """
        Create a new image record in the database.
        
        Args:
            data: Dictionary containing image data
            db: Database session
            
        Returns:
            Created Image object
        """
        # Import here to avoid circular import
        from app.models import Image
        
        db_image = Image(**data)
        db.add(db_image)
        db.commit()
        db.refresh(db_image)
        return db_image
    
    def get_by_id(self, image_id: str, db: Session) -> Optional[Any]:
        """
        Get an image by ID.
        
        Args:
            image_id: ID of the image to retrieve
            db: Database session
            
        Returns:
            Image object or None if not found
        """
        # Import here to avoid circular import
        from app.models import Image
        
        return db.query(Image).filter(Image.id == image_id).first()
    
    def list_images(self, skip: int = 0, limit: int = 100, 
                   user_id: Optional[str] = None, 
                   workspace_id: Optional[str] = None, 
                   db: Session = None) -> List[Any]:
        """
        List images with optional filtering.
        
        Args:
            skip: Number of records to skip
            limit: Maximum number of records to return
            user_id: Filter by user ID
            workspace_id: Filter by workspace ID
            db: Database session
            
        Returns:
            List of Image objects
        """
        # Import here to avoid circular import
        from app.models import Image
        
        query = db.query(Image)
        
        if user_id:
            query = query.filter(Image.user_id == user_id)
        
        if workspace_id:
            query = query.filter(Image.workspace_id == workspace_id)
        
        return query.order_by(Image.created_at.desc()).offset(skip).limit(limit).all()


# Create an instance of the repository
image_repository = ImageRepository() 