from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload, joinedload
from sqlalchemy import select
from app.models import User, Workspace, UserWorkspace
from app.schemas.user_schemas import UserCreate
from typing import List, Optional
from fastapi import HTTPException


class UserService:
    @staticmethod
    async def create_user(db: AsyncSession, user_in: UserCreate, hashed_password: str) -> User:
        """Create a new user with async database operations."""
        if db is None:
            raise HTTPException(status_code=503, detail="Database service unavailable")
            
        user = User(
            first_name=user_in.first_name,
            last_name=user_in.last_name,
            email=user_in.email,
            role=user_in.role,
            hashed_password=hashed_password,
        )
        db.add(user)
        await db.flush()  # Get user.id without committing
        await db.commit()
        await db.refresh(user)
        return user

    @staticmethod
    async def get_user_by_email(db: AsyncSession, email: str, load_workspaces: bool = False) -> Optional[User]:
        """Get user by email with async optimized query."""
        if db is None:
            return None
        
        query = select(User).where(User.email == email)
        if load_workspaces:
            query = query.options(selectinload(User.workspaces))
            
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_user_by_id(db: AsyncSession, user_id: str) -> Optional[User]:
        """Get user by ID with async optimized query."""
        if db is None:
            return None
            
        result = await db.execute(
            select(User).where(User.id == user_id)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def get_user_workspaces(db: AsyncSession, user_id: str) -> List[Workspace]:
        """Get user workspaces with async optimized query to prevent N+1 issues."""
        if db is None:
            return []
            
        result = await db.execute(
            select(Workspace)
            .join(UserWorkspace)
            .where(UserWorkspace.user_id == user_id)
            .options(selectinload(Workspace.owner))  # Async eager loading
        )
        return result.scalars().all()
    