from sqlalchemy.orm import Session
from app.models import User, Workspace, UserWorkspace
from app.schemas.user_schemas import UserCreate

class UserService:
    @staticmethod
    def create_user(db: Session, user_in: UserCreate, hashed_password: str) -> User:
        user = User(
            first_name=user_in.first_name,
            last_name=user_in.last_name,
            email=user_in.email,
            role=user_in.role,
            hashed_password=hashed_password,
        )
        db.add(user)
        db.flush()  # Get user.id
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def get_user_by_email(db: Session, email: str) -> User:
        return db.query(User).filter(User.email == email).first()

    @staticmethod
    def get_user_by_id(db: Session, user_id: str) -> User:
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    def get_user_workspaces(db: Session, user_id: str) -> list:
        return db.query(Workspace).join(UserWorkspace).filter(UserWorkspace.user_id == user_id).all()
