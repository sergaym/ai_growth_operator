"""
Repository for Image model operations.
"""

from typing import Dict, List, Optional, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import desc, asc, select, func


class ImageRepository:
    """Repository for Image model operations."""
    
    async def create(self, data: Dict[str, Any], db: AsyncSession) -> Any:
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
        await db.commit()
        await db.refresh(db_image)
        return db_image
    
    async def get_by_id(self, image_id: str, db: AsyncSession) -> Optional[Any]:
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
        
        result = await db.execute(select(Image).where(Image.id == image_id))
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
        Get all images with optional filtering and pagination.
        
        Args:
            db: Database session
            skip: Number of records to skip
            limit: Maximum number of records to return
            user_id: Filter by user ID
            workspace_id: Filter by workspace ID
            sort_by: Field to sort by
            sort_order: Sort order ('asc' or 'desc')
            
        Returns:
            List of Image objects
        """
        # Import here to avoid circular import
        from app.models import Image
        
        # Start with base query
        query = select(Image)
        
        # Apply filters if provided
        if user_id:
            query = query.where(Image.user_id == user_id)
        if workspace_id:
            query = query.where(Image.workspace_id == workspace_id)
        
        # Apply sorting
        if hasattr(Image, sort_by):
            sort_func = desc if sort_order.lower() == 'desc' else asc
            query = query.order_by(sort_func(getattr(Image, sort_by)))
        
        # Apply pagination
        query = query.offset(skip).limit(limit)
        
        result = await db.execute(query)
        return result.scalars().all()


# Create an instance of the repository
image_repository = ImageRepository() 