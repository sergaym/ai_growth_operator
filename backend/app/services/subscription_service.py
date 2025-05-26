"""
Subscription management service.

This module handles subscription plans and operations.
"""

from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models import (
    Workspace, User, SubscriptionPlan, Subscription, 
    SubscriptionStatus
)
from datetime import datetime


class SubscriptionService:
    """Service for managing subscription plans and subscriptions."""
    
    @staticmethod
    def get_all_plans(db: Session) -> List[SubscriptionPlan]:
        """
        Get all subscription plans ordered by price.
        """
        return db.query(SubscriptionPlan).order_by(SubscriptionPlan.price).all()
    
    @staticmethod
    def get_plan_by_id(db: Session, plan_id: int) -> Optional[SubscriptionPlan]:
        """
        Get a subscription plan by ID.
        """
        return db.query(SubscriptionPlan).filter(SubscriptionPlan.id == plan_id).first()
    
    @staticmethod
    def create_plan(db: Session, plan_data: Dict[str, Any]) -> SubscriptionPlan:
        """
        Create a new subscription plan.
        """
        plan = SubscriptionPlan(**plan_data)
        db.add(plan)
        db.commit()
        db.refresh(plan)
        return plan
    
    @staticmethod
    def update_plan(db: Session, plan_id: int, plan_data: Dict[str, Any]) -> Optional[SubscriptionPlan]:
        """
        Update an existing subscription plan.
        """
        plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.id == plan_id).first()
        if not plan:
            return None
            
        for key, value in plan_data.items():
            setattr(plan, key, value)
            
        plan.updated_at = datetime.utcnow()
        db.add(plan)
        db.commit()
        db.refresh(plan)
        return plan
    
    @staticmethod
    def delete_plan(db: Session, plan_id: int) -> bool:
        """
        Delete a subscription plan.
        Returns True if successful, False if plan not found.
        """
        plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.id == plan_id).first()
        if not plan:
            return False
            
        db.delete(plan)
        db.commit()
        return True
    
    @staticmethod
    def get_workspace_subscriptions(db: Session, workspace_id: str) -> List[Subscription]:
        """
        Get all subscriptions for a workspace.
        """
        return db.query(Subscription).filter(Subscription.workspace_id == workspace_id).all()
    
    @staticmethod
    def get_active_subscription(db: Session, workspace_id: str) -> Optional[Subscription]:
        """
        Get the active subscription for a workspace.
        Returns None if no active subscription is found.
        """
        return db.query(Subscription).filter(
            Subscription.workspace_id == workspace_id,
            Subscription.status == SubscriptionStatus.ACTIVE.value
        ).first()
    
    @staticmethod
    def is_subscription_active(db: Session, workspace_id: str) -> bool:
        """
        Check if a workspace has an active subscription.
        """
        subscription = SubscriptionService.get_active_subscription(db, workspace_id)
        return subscription is not None
    
    @staticmethod
    def get_subscription_by_id(db: Session, subscription_id: int) -> Optional[Subscription]:
        """
        Get a subscription by ID.
        """
        return db.query(Subscription).filter(Subscription.id == subscription_id).first()
    
    @staticmethod
    def create_subscription(db: Session, subscription_data: Dict[str, Any]) -> Subscription:
        """
        Create a new subscription.
        
        Args:
            db: Database session
            subscription_data: Dictionary containing subscription data including:
                - workspace_id: ID of the workspace
                - plan_id: ID of the subscription plan
                - status: Subscription status (e.g., 'active', 'trialing', 'past_due')
                - stripe_subscription_id: Stripe subscription ID (required)
                - start_date: When the subscription starts
                - end_date: When the current billing period ends
                
        Returns:
            The created Subscription object
            
        Raises:
            ValueError: If required fields are missing or invalid
        """
        # Validate required fields
        required_fields = ['workspace_id', 'plan_id', 'status', 'stripe_subscription_id', 'start_date']
        for field in required_fields:
            if field not in subscription_data or not subscription_data[field]:
                raise ValueError(f"Missing required field: {field}")
        
        # Check if a subscription with this Stripe ID already exists
        existing = db.query(Subscription).filter(
            Subscription.stripe_subscription_id == subscription_data['stripe_subscription_id']
        ).first()
        
        if existing:
            # Update existing subscription instead of creating a new one
            for key, value in subscription_data.items():
                setattr(existing, key, value)
            db.add(existing)
            db.commit()
            db.refresh(existing)
            return existing
        
        # Create new subscription
        subscription = Subscription(**subscription_data)
        db.add(subscription)
        db.commit()
        db.refresh(subscription)
        
        return subscription
    
    @staticmethod
    def update_subscription(
        db: Session, 
        subscription_id: int, 
        subscription_data: Dict[str, Any]
    ) -> Optional[Subscription]:
        """
        Update an existing subscription.
        """
        subscription = db.query(Subscription).filter(Subscription.id == subscription_id).first()
        if not subscription:
            return None
            
        for key, value in subscription_data.items():
            setattr(subscription, key, value)
            
        subscription.updated_at = datetime.utcnow()
        db.add(subscription)
        db.commit()
        db.refresh(subscription)
        return subscription
        
    @staticmethod
    def can_add_users_to_workspace(db: Session, workspace_id: str, new_user_count: int = 1) -> bool:
        """
        Check if new users can be added to a workspace based on subscription limits.
        
        Args:
            db: Database session
            workspace_id: Workspace ID
            new_user_count: Number of new users to add
            
        Returns:
            True if users can be added, False otherwise
        """
        # Get active subscription
        subscription = SubscriptionService.get_active_subscription(db, workspace_id)
        if not subscription:
            return False  # No active subscription
            
        # Get subscription plan
        plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.id == subscription.plan_id).first()
        if not plan:
            return False
            
        # Get current user count
        workspace = db.query(Workspace).filter(Workspace.id == workspace_id).first()
        if not workspace:
            return False
            
        current_user_count = db.query(Workspace).join(
            Workspace.user_workspaces
        ).filter(
            Workspace.id == workspace_id
        ).count()
        
        # Check if adding new users would exceed the plan limit
        return (current_user_count + new_user_count) <= plan.max_users
