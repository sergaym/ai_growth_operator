"""
Stripe subscription service.

This module handles interactions with the Stripe API for subscription management.
"""

import stripe
from datetime import datetime
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models import (
    Workspace, User, SubscriptionPlan, Subscription, 
    PaymentMethod, Invoice, SubscriptionStatus, InvoiceStatus
)

# Initialize Stripe with API key
stripe.api_key = settings.STRIPE_API_KEY


class StripeService:
    """Service for handling Stripe operations for subscriptions."""
    
    @staticmethod
    def sync_subscription_plans(db: Session) -> List[SubscriptionPlan]:
        """
        Sync subscription plans with Stripe.
        Creates Stripe products and prices for each plan in the database.
        """
        plans = db.query(SubscriptionPlan).all()
        
        for plan in plans:
            # Create or retrieve Stripe product
            if not plan.stripe_product_id:
                product = stripe.Product.create(
                    name=plan.name,
                    description=plan.description or f"{plan.name} Plan - {plan.max_users} users"
                )
                plan.stripe_product_id = product.id
            
            # Create or retrieve Stripe price
            if not plan.stripe_price_id:
                price = stripe.Price.create(
                    product=plan.stripe_product_id,
                    unit_amount=int(float(plan.price) * 100),  # Convert to cents
                    currency=plan.currency.lower(),
                    recurring={"interval": plan.billing_interval}
                )
                plan.stripe_price_id = price.id
                
            db.add(plan)
        
        db.commit()
        return plans
    
    @staticmethod
    def create_or_update_customer(db: Session, workspace: Workspace, user: User) -> str:
        """
        Create or update a Stripe customer for a workspace.
        Returns the Stripe customer ID.
        """
        customer_data = {
            "email": user.email,
            "name": f"{user.first_name} {user.last_name}",
            "metadata": {
                "workspace_id": str(workspace.id),
                "user_id": str(user.id)
            }
        }
        
        if workspace.stripe_customer_id:
            # Update existing customer
            customer = stripe.Customer.modify(
                workspace.stripe_customer_id,
                **customer_data
            )
        else:
            # Create new customer
            customer = stripe.Customer.create(**customer_data)
            
        return customer.id
        
    @staticmethod
    def create_checkout_session(
        db: Session, 
        workspace_id: int, 
        plan_id: int,
        success_url: str = None
    ) -> Dict[str, Any]:
        """
        Create a new Stripe checkout session for a subscription.
        
        Args:
            db: Database session
            workspace_id: ID of the workspace subscribing
            plan_id: ID of the subscription plan
            success_url: Optional custom success URL (if None, uses settings.STRIPE_SUCCESS_URL)
            
        Returns:
            Dictionary containing the checkout session URL and ID
        """
        # Get the workspace and plan
        workspace = db.query(Workspace).filter(Workspace.id == workspace_id).first()
        if not workspace:
            raise ValueError(f"Workspace with ID {workspace_id} not found")
            
        plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.id == plan_id).first()
        if not plan:
            raise ValueError(f"Subscription plan with ID {plan_id} not found")
            
        if not plan.stripe_price_id:
            raise ValueError(f"No Stripe price ID found for plan {plan_id}")
            
        # Create or retrieve Stripe customer
        customer_id = workspace.stripe_customer_id
        if not customer_id:
            # Get the workspace owner
            owner = db.query(User).filter(
                User.id == workspace.owner_id
            ).first()
            
            customer = stripe.Customer.create(
                email=owner.email,
                name=f"{owner.first_name} {owner.last_name}",
                metadata={
                    "workspace_id": str(workspace_id),
                    "plan_id": str(plan_id)
                }
            )
            customer_id = customer.id
            
            # Update workspace with Stripe customer ID
            workspace.stripe_customer_id = customer_id
            db.add(workspace)
            db.commit()
        
        # Create checkout session with no trial period
        session = stripe.checkout.Session.create(
            customer=customer_id,
            payment_method_types=['card', 'paypal'],
            line_items=[{
                'price': plan.stripe_price_id,
                'quantity': 1,
            }],
            mode='subscription',
            success_url=success_url or settings.STRIPE_SUCCESS_URL,
            cancel_url=settings.STRIPE_CANCEL_URL,
            metadata={
                'workspace_id': str(workspace_id),
                'plan_id': str(plan_id)
            },
            subscription_data={
                'metadata': {
                    'workspace_id': str(workspace_id),
                    'plan_id': str(plan_id)
                },
                'payment_behavior': 'allow_incomplete'
            }
        )
        
        return {
            'id': session.id,
            'url': session.url,
            'customer_id': customer_id
        }
    
    @staticmethod
    def handle_subscription_created(db: Session, event_data: Dict[str, Any]) -> Subscription:
        """
        Handle Stripe subscription.created webhook event.
        Creates a new subscription record in the database.
        """
        stripe_subscription = event_data["object"]
        event_id = event_data.get("id", "unknown_event_id") # Get event ID for logging

        print(f"[Webhook handle_subscription_created - Event ID: {event_id}] Received Stripe Subscription object: {stripe_subscription}")
        
        metadata = stripe_subscription.get("metadata", {})
        print(f"[Webhook handle_subscription_created - Event ID: {event_id}] Subscription metadata: {metadata}")

        workspace_id_str = metadata.get("workspace_id")
        plan_id_str = metadata.get("plan_id")

        print(f"[Webhook handle_subscription_created - Event ID: {event_id}] Extracted workspace_id_str: '{workspace_id_str}', plan_id_str: '{plan_id_str}'")

        if not workspace_id_str or not plan_id_str:
            error_msg = f"Missing workspace_id or plan_id in subscription metadata for Stripe subscription ID: {stripe_subscription.get('id')}, Event ID: {event_id}"
            print(f"[Webhook handle_subscription_created - ERROR] {error_msg}")
            # Depending on your error strategy, you might raise an exception or handle differently.
            # Raising an error here will cause Stripe to retry the webhook if not handled upstream.
            raise ValueError(error_msg)

        try:
            workspace_id = int(workspace_id_str)
            plan_id = int(plan_id_str)
        except ValueError as e:
            error_msg = f"Could not convert workspace_id or plan_id to int. workspace_id_str: '{workspace_id_str}', plan_id_str: '{plan_id_str}'. Error: {e}, Event ID: {event_id}"
            print(f"[Webhook handle_subscription_created - ERROR] {error_msg}")
            raise ValueError(error_msg) # Propagate error
        
        # Check if subscription already exists (idempotency)
        existing_subscription = db.query(Subscription).filter(
            Subscription.stripe_subscription_id == stripe_subscription["id"]
        ).first()

        if existing_subscription:
            print(f"[Webhook handle_subscription_created - Event ID: {event_id}] Subscription with Stripe ID {stripe_subscription['id']} already exists. Skipping creation.")
            return existing_subscription

        print(f"[Webhook handle_subscription_created - Event ID: {event_id}] Creating new subscription record for workspace_id: {workspace_id}, plan_id: {plan_id}")
        # Create subscription record
        subscription = Subscription(
            workspace_id=workspace_id,
            plan_id=plan_id,
            status=SubscriptionStatus.ACTIVE.value,
            stripe_subscription_id=stripe_subscription["id"],
            start_date=datetime.fromtimestamp(stripe_subscription["items"]["data"][0]["current_period_start"]),
            end_date=datetime.fromtimestamp(stripe_subscription["items"]["data"][0]["current_period_end"])
        )
        
        db.add(subscription)
        db.commit()
        db.refresh(subscription)
        
        return subscription
    
    @staticmethod
    def handle_subscription_updated(db: Session, event_data: Dict[str, Any]) -> Optional[Subscription]:
        """
        Handle Stripe subscription.updated webhook event.
        Updates the subscription record in the database.
        """
        stripe_subscription = event_data["object"]
        event_id = event_data.get("id", "unknown_event_id")

        print(f"[Webhook handle_subscription_updated - Event ID: {event_id}] Received Stripe Subscription object for update: {stripe_subscription}")

        subscription = db.query(Subscription).filter(
            Subscription.stripe_subscription_id == stripe_subscription["id"]
        ).first()
        
        if not subscription:
            print(f"[Webhook handle_subscription_updated - WARNING - Event ID: {event_id}] Subscription with Stripe ID {stripe_subscription['id']} not found in database. Cannot update.")
            # If subscription doesn't exist, this could be a subscription from another system or an issue.
            return None
        
        print(f"[Webhook handle_subscription_updated - Event ID: {event_id}] Found existing subscription ID {subscription.id} for Stripe ID {stripe_subscription['id']}. Current status: {subscription.status}")

        # Update subscription status based on Stripe status
        stripe_status = stripe_subscription["status"]
        if stripe_status == "active":
            subscription.status = SubscriptionStatus.ACTIVE.value
        elif stripe_status == "past_due":
            subscription.status = SubscriptionStatus.PAST_DUE.value
        elif stripe_status == "unpaid":
            subscription.status = SubscriptionStatus.UNPAID.value
        elif stripe_status == "canceled":
            subscription.status = SubscriptionStatus.CANCELED.value
            subscription.canceled_at = datetime.utcnow()
        elif stripe_status == "trialing":
            subscription.status = SubscriptionStatus.TRIALING.value
        
        new_start_date = datetime.fromtimestamp(stripe_subscription["items"]["data"][0]["current_period_start"])
        new_end_date = datetime.fromtimestamp(stripe_subscription["items"]["data"][0]["current_period_end"])
        new_canceled_at = (
            datetime.fromtimestamp(stripe_subscription["canceled_at"]) 
            if stripe_subscription.get("canceled_at") is not None 
            else None
        )
        new_stripe_status = stripe_subscription["status"]

        print(f"[Webhook handle_subscription_updated - Event ID: {event_id}] Updating subscription. New Stripe Status: {new_stripe_status}, New Start: {new_start_date}, New End: {new_end_date}")

        subscription.status = new_stripe_status
        subscription.start_date = new_start_date
        subscription.end_date = new_end_date
        subscription.canceled_at = new_canceled_at
        
        db.add(subscription)
        db.commit()
        db.refresh(subscription)
        
        print(f"[Webhook handle_subscription_updated - Event ID: {event_id}] Successfully updated subscription ID {subscription.id}. New local status: {subscription.status}")
        return subscription
    
    @staticmethod
    def handle_subscription_deleted(db: Session, event_data: Dict[str, Any]) -> Optional[Subscription]:
        """
        Handle Stripe subscription.deleted webhook event.
        Updates the subscription record in the database.
        """
        stripe_subscription = event_data["object"]
        event_id = event_data.get("id", "unknown_event_id")

        print(f"[Webhook handle_subscription_deleted - Event ID: {event_id}] Received Stripe Subscription object for deletion: {stripe_subscription}")

        subscription = db.query(Subscription).filter(
            Subscription.stripe_subscription_id == stripe_subscription["id"]
        ).first()
        
        if not subscription:
            print(f"[Webhook handle_subscription_deleted - WARNING - Event ID: {event_id}] Subscription with Stripe ID {stripe_subscription['id']} not found in database. Cannot mark as deleted.")
            return None
        
        if subscription.status == SubscriptionStatus.CANCELED.value:
            print(f"[Webhook handle_subscription_deleted - INFO - Event ID: {event_id}] Subscription ID {subscription.id} (Stripe ID {stripe_subscription['id']}) is already marked as CANCELED.")
            return subscription # Already processed

        print(f"[Webhook handle_subscription_deleted - Event ID: {event_id}] Marking subscription ID {subscription.id} (Stripe ID {stripe_subscription['id']}) as CANCELED.")

        subscription.status = SubscriptionStatus.CANCELED.value
        # If Stripe sends a specific cancellation timestamp, use that. Otherwise, utcnow is fine.
        # stripe_subscription.get('canceled_at') might be available and more accurate.
        canceled_at_timestamp = stripe_subscription.get('canceled_at')
        if canceled_at_timestamp:
            subscription.canceled_at = datetime.fromtimestamp(canceled_at_timestamp)
            print(f"[Webhook handle_subscription_deleted - Event ID: {event_id}] Using Stripe's canceled_at: {subscription.canceled_at}")
        else:
            subscription.canceled_at = datetime.utcnow()
            print(f"[Webhook handle_subscription_deleted - Event ID: {event_id}] Using current UTC time for canceled_at: {subscription.canceled_at}")
        
        db.add(subscription)
        db.commit()
        db.refresh(subscription)

        print(f"[Webhook handle_subscription_deleted - Event ID: {event_id}] Successfully marked subscription ID {subscription.id} as CANCELED.")        
        return subscription
    
    @staticmethod
    def handle_invoice_created(db: Session, event_data: Dict[str, Any]) -> Optional[Invoice]:
        """
        Handle Stripe invoice.created webhook event.
        Creates a new invoice record in the database when an invoice is created.
        """
        stripe_invoice = event_data["object"]
        stripe_subscription_id = stripe_invoice.get("subscription")
        
        if not stripe_subscription_id:
            return None
            
        subscription = db.query(Subscription).filter(
            Subscription.stripe_subscription_id == stripe_subscription_id
        ).first()
        
        if not subscription:
            return None
            
        # Check if invoice already exists
        invoice = db.query(Invoice).filter(
            Invoice.stripe_invoice_id == stripe_invoice["id"]
        ).first()
        
        if not invoice:
            # Create new invoice
            invoice = Invoice(
                subscription_id=subscription.id,
                workspace_id=subscription.workspace_id,
                amount=float(stripe_invoice["amount_due"]) / 100,
                currency=stripe_invoice["currency"],
                status=stripe_invoice["status"],
                stripe_invoice_id=stripe_invoice["id"],
                invoice_pdf_url=stripe_invoice.get("invoice_pdf"),
                invoice_date=datetime.fromtimestamp(stripe_invoice["created"]),
                due_date=datetime.fromtimestamp(stripe_invoice["due_date"]) if stripe_invoice.get("due_date") else None
            )
            
            db.add(invoice)
            db.commit()
            db.refresh(invoice)
        
        return invoice
    
    @staticmethod
    def handle_invoice_paid(db: Session, event_data: Dict[str, Any]) -> Optional[Invoice]:
        """
        Handle Stripe invoice.paid webhook event.
        Updates an existing invoice record in the database when payment is received.
        """
        stripe_invoice = event_data["object"]
        stripe_subscription_id = stripe_invoice.get("subscription")
        
        if not stripe_subscription_id:
            return None
            
        subscription = db.query(Subscription).filter(
            Subscription.stripe_subscription_id == stripe_subscription_id
        ).first()
        
        if not subscription:
            return None
            
        # Find or create invoice
        invoice = db.query(Invoice).filter(
            Invoice.stripe_invoice_id == stripe_invoice["id"]
        ).first()
        
        if not invoice:
            # If invoice doesn't exist, create it (should be rare as invoice.created should fire first)
            return StripeService.handle_invoice_created(db, event_data)
            
        # Update invoice with payment details
        invoice.status = InvoiceStatus.PAID.value
        invoice.paid_date = datetime.fromtimestamp(stripe_invoice["status_transitions"]["paid_at"])
        invoice.amount = float(stripe_invoice["amount_paid"]) / 100  # Update with actual paid amount
        
        # Update subscription dates if this is a renewal
        if stripe_invoice.get("billing_reason") == "subscription_cycle":
            subscription.start_date = datetime.fromtimestamp(stripe_invoice["lines"]["data"][0]["period"]["start"])
            subscription.end_date = datetime.fromtimestamp(stripe_invoice["lines"]["data"][0]["period"]["end"])
            db.add(subscription)
        
        db.add(invoice)
        db.commit()
        db.refresh(invoice)
        
        return invoice
    
    @staticmethod
    def handle_payment_method_attached(db: Session, event_data: Dict[str, Any]) -> Optional[PaymentMethod]:
        """
        Handle Stripe payment_method.attached webhook event.
        Creates or updates a payment method record in the database.
        """
        stripe_payment_method = event_data["object"]
        customer_id = stripe_payment_method.get("customer")
        
        if not customer_id:
            return None
            
        workspace = db.query(Workspace).filter(
            Workspace.stripe_customer_id == customer_id
        ).first()
        
        if not workspace:
            return None
            
        card = stripe_payment_method.get("card", {})
        
        # Find the workspace owner
        owner = db.query(User).filter(User.id == workspace.owner_id).first()
        
        # Create payment method record
        payment_method = PaymentMethod(
            user_id=owner.id,
            workspace_id=workspace.id,
            type=stripe_payment_method["type"],
            last4=card.get("last4"),
            brand=card.get("brand"),
            exp_month=card.get("exp_month"),
            exp_year=card.get("exp_year"),
            stripe_payment_method_id=stripe_payment_method["id"],
            is_default=True  # First payment method is default
        )
        
        # Set existing payment methods as non-default
        existing_payment_methods = db.query(PaymentMethod).filter(
            PaymentMethod.workspace_id == workspace.id,
            PaymentMethod.is_default == True
        ).all()
        
        for pm in existing_payment_methods:
            pm.is_default = False
            db.add(pm)
            
        db.add(payment_method)
        db.commit()
        db.refresh(payment_method)
        
        return payment_method
    
    @staticmethod
    def cancel_subscription(db: Session, subscription_id: int) -> Subscription:
        """
        Cancel a subscription in Stripe and update the database record.
        """
        subscription = db.query(Subscription).filter(Subscription.id == subscription_id).first()
        if not subscription:
            raise ValueError(f"Subscription with ID {subscription_id} not found")
            
        if subscription.status == SubscriptionStatus.CANCELED.value:
            return subscription  # Already canceled
            
        if not subscription.stripe_subscription_id:
            raise ValueError(f"Subscription {subscription_id} has no Stripe subscription ID")
            
        # Cancel in Stripe
        stripe.Subscription.delete(subscription.stripe_subscription_id)
        
        # Update subscription in database
        subscription.status = SubscriptionStatus.CANCELED.value
        subscription.canceled_at = datetime.utcnow()
        
        db.add(subscription)
        db.commit()
        db.refresh(subscription)
        
        return subscription
    
    @staticmethod
    def get_customer_portal_session(db: Session, workspace_id: int) -> Dict[str, Any]:
        """
        Create a Stripe customer portal session for managing subscriptions.
        Returns the portal URL.
        """
        workspace = db.query(Workspace).filter(Workspace.id == workspace_id).first()
        if not workspace:
            raise ValueError(f"Workspace with ID {workspace_id} not found")
            
        if not workspace.stripe_customer_id:
            raise ValueError(f"Workspace {workspace_id} has no Stripe customer ID")
            
        # Create portal session
        session = stripe.billing_portal.Session.create(
            customer=workspace.stripe_customer_id,
            return_url=f"{settings.FRONTEND_URL}/playground/{workspace_id}/billing"
        )
        
        return {
            "portal_url": session.url
        }
