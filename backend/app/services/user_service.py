from sqlalchemy.orm import Session
from sqlalchemy.orm import joinedload
from app.models import User, Workspace, UserWorkspace
from app.schemas.user_schemas import UserCreate
from typing import List, Optional
import asyncio
import functools

class UserService:
    @staticmethod
    def create_user(db: Session, user_in: UserCreate, hashed_password: str) -> User:
        """Create a new user with optimized database operations."""
        user = User(
            first_name=user_in.first_name,
            last_name=user_in.last_name,
            email=user_in.email,
            role=user_in.role,
            hashed_password=hashed_password,
        )
        db.add(user)
        db.flush()  # Get user.id without committing
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def get_user_by_email(db: Session, email: str) -> Optional[User]:
        """Get user by email with optimized query."""
        return db.query(User).filter(User.email == email).first()

    @staticmethod
    def get_user_by_id(db: Session, user_id: str) -> Optional[User]:
        """Get user by ID with optimized query."""
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    def get_user_workspaces(db: Session, user_id: str) -> List[Workspace]:
        """Get user workspaces with optimized query to prevent N+1 issues."""
        return (
            db.query(Workspace)
            .join(UserWorkspace)
            .filter(UserWorkspace.user_id == user_id)
            .options(joinedload(Workspace.owner))  # Eager load owner to prevent N+1
            .all()
        )
    