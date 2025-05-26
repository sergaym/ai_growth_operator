from typing import List, Optional, Dict, Any, Tuple
from sqlalchemy.orm import Session
from app.models import Workspace, User, UserWorkspace, Subscription, SubscriptionStatus, SubscriptionPlan
from app.core.security import get_password_hash
from datetime import datetime
from fastapi import HTTPException

class WorkspaceService:
    @staticmethod
    def get_user_workspaces(db: Session, user_id: int) -> List[Workspace]:
        return db.query(Workspace).join(Workspace.users).filter(Workspace.users.any(id=user_id)).all()

    @staticmethod
    def get_workspace_by_id(db: Session, workspace_id: int) -> Optional[Workspace]:
        return db.query(Workspace).filter(Workspace.id == workspace_id).first()
    
    @staticmethod
    def get_workspace_with_subscription(db: Session, workspace_id: int) -> Optional[Dict[str, Any]]:
        """Get workspace with its active subscription details"""
        workspace = WorkspaceService.get_workspace_by_id(db, workspace_id)
        if not workspace:
            return None
        
        # Get active subscription
        active_subscription = db.query(Subscription).filter(
            Subscription.workspace_id == workspace_id,
            Subscription.status == SubscriptionStatus.ACTIVE.value
        ).first()
        
        return {
            "workspace": workspace,
            "subscription": active_subscription
        }

    @staticmethod
    def update_workspace_name(db: Session, workspace_id: int, new_name: str) -> Workspace:
        workspace = WorkspaceService.get_workspace_by_id(db, workspace_id)
        if not workspace:
            raise ValueError("Workspace not found")
            
        workspace.name = new_name
        db.commit()
        db.refresh(workspace)
        return workspace
    
    @staticmethod
    def user_has_access(db: Session, user_id: int, workspace_id: int) -> bool:
        """Check if a user has access to a workspace"""
        user_workspace = db.query(UserWorkspace).filter(
            UserWorkspace.user_id == user_id,
            UserWorkspace.workspace_id == workspace_id
        ).first()
        
        return user_workspace is not None
    
    @staticmethod
    def is_workspace_owner(db: Session, user_id: int, workspace_id: int) -> bool:
        """Check if a user is the owner of a workspace"""
        workspace = WorkspaceService.get_workspace_by_id(db, workspace_id)
        if not workspace:
            return False
        
        return workspace.owner_id == user_id
    
    @staticmethod
    def get_workspace_users(db: Session, workspace_id: int) -> List[User]:
        """Get all users in a workspace"""
        workspace = WorkspaceService.get_workspace_by_id(db, workspace_id)
        if not workspace:
            return []
        
        return workspace.users
    
    @staticmethod
    def count_workspace_users(db: Session, workspace_id: int) -> int:
        """Count the number of users in a workspace"""
        return db.query(UserWorkspace).filter(UserWorkspace.workspace_id == workspace_id).count()
    
    @staticmethod
    def get_workspace_subscription_details(db: Session, workspace_id: int) -> Tuple[Optional[Subscription], Optional[SubscriptionPlan], int]:
        """Get workspace subscription details including the plan and current user count"""
        # Get active subscription
        active_subscription = db.query(Subscription).filter(
            Subscription.workspace_id == workspace_id,
            Subscription.status == SubscriptionStatus.ACTIVE.value
        ).first()
        
        # Get subscription plan if subscription exists
        plan = None
        if active_subscription and active_subscription.plan_id:
            plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.id == active_subscription.plan_id).first()
        
        # Count current workspace users
        user_count = WorkspaceService.count_workspace_users(db, workspace_id)
        
        return active_subscription, plan, user_count
    
    @staticmethod
    def add_user_to_workspace(db: Session, user_id: int, workspace_id: int, role: str = "member") -> UserWorkspace:
        """Add a user to a workspace with subscription limit enforcement"""
        # Check if user is already in workspace
        existing = db.query(UserWorkspace).filter(
            UserWorkspace.user_id == user_id,
            UserWorkspace.workspace_id == workspace_id
        ).first()
        
        if existing:
            return existing
        
        # Check subscription limits
        active_subscription, plan, current_user_count = WorkspaceService.get_workspace_subscription_details(db, workspace_id)
        
        # If there's an active plan with user limits, enforce them
        if plan and plan.max_users is not None:
            if current_user_count >= plan.max_users:
                raise HTTPException(
                    status_code=403, 
                    detail=f"Cannot add more users. Your subscription plan '{plan.name}' has a limit of {plan.max_users} users. "
                           f"Please upgrade your subscription to add more users."
                )
        
        # Add user to workspace
        user_workspace = UserWorkspace(
            user_id=user_id,
            workspace_id=workspace_id,
            role=role,
            active=True,
            joined_at=datetime.now()
        )
        
        db.add(user_workspace)
        db.commit()
        db.refresh(user_workspace)
        
        return user_workspace
    
    @staticmethod
    def remove_user_from_workspace(db: Session, user_id: int, workspace_id: int) -> bool:
        """Remove a user from a workspace"""
        # Cannot remove the owner
        workspace = WorkspaceService.get_workspace_by_id(db, workspace_id)
        if not workspace or workspace.owner_id == user_id:
            return False
        
        # Remove user from workspace
        user_workspace = db.query(UserWorkspace).filter(
            UserWorkspace.user_id == user_id,
            UserWorkspace.workspace_id == workspace_id
        ).first()
        
        if not user_workspace:
            return False
        
        db.delete(user_workspace)
        db.commit()
        
        return True
