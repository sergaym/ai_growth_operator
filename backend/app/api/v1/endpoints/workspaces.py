from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.services.workspace_service import WorkspaceService
from app.db.database import get_db
from app.core.security import get_current_user
from app.models import User
from app.schemas.models import WorkspaceResponse
from typing import List

router = APIRouter()

@router.get("/", response_model=List[WorkspaceResponse], tags=["workspaces"])
async def get_user_workspaces(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    workspaces = WorkspaceService.get_user_workspaces(db, current_user.id)
    return [WorkspaceResponse.from_orm(w) for w in workspaces]

@router.put("/{workspace_id}/name", tags=["workspaces"])
async def update_workspace_name(
    workspace_id: str,
    new_name: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    workspace = WorkspaceService.get_workspace_by_id(db, workspace_id)
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")
    
    if workspace.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this workspace")
    
    updated_workspace = WorkspaceService.update_workspace_name(db, workspace_id, new_name)
    return WorkspaceResponse.from_orm(updated_workspace)
