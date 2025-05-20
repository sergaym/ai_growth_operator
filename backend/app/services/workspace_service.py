from typing import List, Optional
from sqlalchemy.orm import Session
from app.models import Workspace
from app.core.security import get_password_hash

class WorkspaceService:
    @staticmethod
    def get_user_workspaces(db: Session, user_id: str) -> List[Workspace]:
        return db.query(Workspace).join(Workspace.users).filter(Workspace.users.any(id=user_id)).all()

    @staticmethod
    def get_workspace_by_id(db: Session, workspace_id: str) -> Optional[Workspace]:
        return db.query(Workspace).filter(Workspace.id == workspace_id).first()

    @staticmethod
    def update_workspace_name(db: Session, workspace_id: str, new_name: str) -> Workspace:
        workspace = WorkspaceService.get_workspace_by_id(db, workspace_id)
        if not workspace:
            raise ValueError("Workspace not found")
            
        workspace.name = new_name
        db.commit()
        db.refresh(workspace)
        return workspace
