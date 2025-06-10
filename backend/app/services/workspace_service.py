from typing import List, Optional, Dict, Any, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select, func
from app.models import Workspace, User, UserWorkspace, Subscription, SubscriptionStatus, SubscriptionPlan
from app.core.security import get_password_hash
from datetime import datetime
from fastapi import HTTPException

class WorkspaceService:
    @staticmethod
    async def get_user_workspaces(db: AsyncSession, user_id: str) -> List[Workspace]:
        if db is None:
            return []
            
        result = await db.execute(
            select(Workspace)
            .join(UserWorkspace)
            .where(UserWorkspace.user_id == user_id)
            .options(selectinload(Workspace.users))
        )
        return result.scalars().all()

    @staticmethod
    async def get_workspace_by_id(db: AsyncSession, workspace_id: str) -> Optional[Workspace]:
        if db is None:
            return None
            
        result = await db.execute(
            select(Workspace).where(Workspace.id == workspace_id)
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def get_workspace_with_subscription(db: AsyncSession, workspace_id: str) -> Optional[Dict[str, Any]]:
        """Get workspace with its active subscription details"""
        workspace = await WorkspaceService.get_workspace_by_id(db, workspace_id)
        if not workspace:
            return None
        
        # Get active subscription
        result = await db.execute(
            select(Subscription).where(
                Subscription.workspace_id == workspace_id,
                Subscription.status == SubscriptionStatus.ACTIVE.value
            )
        )
        active_subscription = result.scalar_one_or_none()
        
        return {
            "workspace": workspace,
            "subscription": active_subscription
        }

    @staticmethod
    async def update_workspace_name(db: AsyncSession, workspace_id: str, new_name: str) -> Workspace:
        workspace = await WorkspaceService.get_workspace_by_id(db, workspace_id)
        if not workspace:
            raise ValueError("Workspace not found")
            
        workspace.name = new_name
        await db.commit()
        await db.refresh(workspace)
        return workspace
    
    @staticmethod
    async def user_has_access(db: AsyncSession, user_id: str, workspace_id: str) -> bool:
        """Check if a user has access to a workspace"""
        if db is None:
            return False
            
        result = await db.execute(
            select(UserWorkspace).where(
                UserWorkspace.user_id == user_id,
                UserWorkspace.workspace_id == workspace_id
            )
        )
        user_workspace = result.scalar_one_or_none()
        
        return user_workspace is not None
    
    @staticmethod
    async def is_workspace_owner(db: AsyncSession, user_id: str, workspace_id: str) -> bool:
        """Check if a user is the owner of a workspace"""
        workspace = await WorkspaceService.get_workspace_by_id(db, workspace_id)
        if not workspace:
            return False
        
        return workspace.owner_id == user_id
    
    @staticmethod
    async def get_workspace_users(db: AsyncSession, workspace_id: str) -> List[User]:
        """Get all users in a workspace"""
        workspace = await WorkspaceService.get_workspace_by_id(db, workspace_id)
        if not workspace:
            return []
        
        return workspace.users
    
    @staticmethod
    async def count_workspace_users(db: AsyncSession, workspace_id: str) -> int:
        """Count the number of users in a workspace"""
        result = await db.execute(
            select(func.count()).select_from(UserWorkspace).where(UserWorkspace.workspace_id == workspace_id)
        )
        return result.scalar()
    
    @staticmethod
    async def get_workspace_subscription_details(db: AsyncSession, workspace_id: str) -> Tuple[Optional[Subscription], Optional[SubscriptionPlan], int]:
        """Get workspace subscription details including the plan and current user count"""
        # Get active subscription
        result = await db.execute(
            select(Subscription).where(
                Subscription.workspace_id == workspace_id,
                Subscription.status == SubscriptionStatus.ACTIVE.value
            )
        )
        active_subscription = result.scalar_one_or_none()
        
        # Get subscription plan if subscription exists
        plan = None
        if active_subscription and active_subscription.plan_id:
            result = await db.execute(
                select(SubscriptionPlan).where(SubscriptionPlan.id == active_subscription.plan_id)
            )
            plan = result.scalar_one_or_none()
        
        # Count current workspace users
        user_count = await WorkspaceService.count_workspace_users(db, workspace_id)
        
        return active_subscription, plan, user_count
    
    @staticmethod
    async def add_user_to_workspace(db: AsyncSession, user_id: str, workspace_id: str, role: str = "member") -> UserWorkspace:
        """Add a user to a workspace with subscription limit enforcement"""
        # Check if user is already in workspace
        result = await db.execute(
            select(UserWorkspace).where(
                UserWorkspace.user_id == user_id,
                UserWorkspace.workspace_id == workspace_id
            )
        )
        existing = result.scalar_one_or_none()
        
        if existing:
            return existing
        
        # Check subscription limits
        active_subscription, plan, current_user_count = await WorkspaceService.get_workspace_subscription_details(db, workspace_id)
        
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
        await db.commit()
        await db.refresh(user_workspace)
        
        return user_workspace
    
    @staticmethod
    async def remove_user_from_workspace(db: AsyncSession, user_id: str, workspace_id: str) -> bool:
        """Remove a user from a workspace"""
        # Cannot remove the owner
        workspace = await WorkspaceService.get_workspace_by_id(db, workspace_id)
        if not workspace or workspace.owner_id == user_id:
            return False
        
        # Remove user from workspace
        result = await db.execute(
            select(UserWorkspace).where(
                UserWorkspace.user_id == user_id,
                UserWorkspace.workspace_id == workspace_id
            )
        )
        user_workspace = result.scalar_one_or_none()
        
        if not user_workspace:
            return False
        
        await db.delete(user_workspace)
        await db.commit()
        
        return True
