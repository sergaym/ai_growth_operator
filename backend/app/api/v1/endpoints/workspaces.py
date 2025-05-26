from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.services.workspace_service import WorkspaceService
from app.services.subscription_service import SubscriptionService
from app.db.database import get_db
from app.core.security import get_current_user
from app.models import User
from app.schemas.models import WorkspaceResponse, WorkspaceWithSubscriptionResponse, UserResponse
from typing import List, Optional

router = APIRouter()

@router.get("/", response_model=List[WorkspaceResponse], tags=["workspaces"])
async def get_user_workspaces(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    workspaces = WorkspaceService.get_user_workspaces(db, current_user.id)
    return workspaces


@router.get("/{workspace_id}", response_model=WorkspaceWithSubscriptionResponse, tags=["workspaces"])
async def get_workspace_with_subscription(
    workspace_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get workspace details with active subscription info"""
    # Check if user has access to workspace
    if not WorkspaceService.user_has_access(db, current_user.id, workspace_id):
        raise HTTPException(status_code=403, detail="Not authorized to access this workspace")
    
    workspace_data = WorkspaceService.get_workspace_with_subscription(db, workspace_id)
    if not workspace_data:
        raise HTTPException(status_code=404, detail="Workspace not found")
    
    # Prepare response
    result = WorkspaceWithSubscriptionResponse.model_validate(workspace_data["workspace"])
    if workspace_data["subscription"]:
        result.active_subscription = workspace_data["subscription"]
    
    return result

@router.put("/{workspace_id}/name", response_model=WorkspaceResponse, tags=["workspaces"])
async def update_workspace_name(
    workspace_id: int,
    new_name: str = Query(..., description="New name for the workspace"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update workspace name"""
    workspace = WorkspaceService.get_workspace_by_id(db, workspace_id)
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")
    
    if workspace.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this workspace")
    
    updated_workspace = WorkspaceService.update_workspace_name(db, workspace_id, new_name)
    return updated_workspace


@router.get("/{workspace_id}/users", response_model=List[UserResponse], tags=["workspaces"])
async def get_workspace_users(
    workspace_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all users in a workspace"""
    # Check if user has access to workspace
    if not WorkspaceService.user_has_access(db, current_user.id, workspace_id):
        raise HTTPException(status_code=403, detail="Not authorized to access this workspace")
    
    users = WorkspaceService.get_workspace_users(db, workspace_id)
    return users


@router.post("/{workspace_id}/users/{user_id}", tags=["workspaces"])
async def add_user_to_workspace(
    workspace_id: int,
    user_id: int,
    role: str = Query("member", description="User role in the workspace"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add a user to a workspace"""
    # Check if current user is workspace owner
    if not WorkspaceService.is_workspace_owner(db, current_user.id, workspace_id):
        raise HTTPException(status_code=403, detail="Only workspace owner can add users")
    
    # The user limit check is now handled directly in the WorkspaceService.add_user_to_workspace method
    try:
        user_workspace = WorkspaceService.add_user_to_workspace(db, user_id, workspace_id, role)
        return {"success": True, "message": "User added to workspace"}
    except HTTPException as e:
        # Propagate HTTPException with its status code and detail
        raise e
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{workspace_id}/users/{user_id}", tags=["workspaces"])
async def remove_user_from_workspace(
    workspace_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Remove a user from a workspace"""
    # Check if current user is workspace owner
    if not WorkspaceService.is_workspace_owner(db, current_user.id, workspace_id):
        raise HTTPException(status_code=403, detail="Only workspace owner can remove users")
    
    # Cannot remove workspace owner
    if WorkspaceService.is_workspace_owner(db, user_id, workspace_id):
        raise HTTPException(status_code=403, detail="Cannot remove workspace owner")
    
    success = WorkspaceService.remove_user_from_workspace(db, user_id, workspace_id)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to remove user from workspace")
    
    return {"success": True, "message": "User removed from workspace"}
