"""
Subscription API endpoints.

This module provides endpoints for managing subscription plans and workspace subscriptions.
"""

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
import stripe
import json
from datetime import datetime
from pydantic import BaseModel

from app.core.config import settings
from app.db.database import get_db
from app.core.security import get_current_user
from app.models import User, Workspace, Subscription as DBSubscription
from app.schemas.subscription_schemas import (
    Subscription,
    SubscriptionPlanResponse,
    SubscriptionResponse,
    SubscriptionStatus
)
from app.services.subscription_service import SubscriptionService
from app.services.stripe_service import StripeService
from app.services.workspace_service import WorkspaceService

# Initialize Stripe with API key
stripe.api_key = settings.STRIPE_API_KEY


router = APIRouter()


class InvoiceResponse(BaseModel):
    """Response model for invoice data."""
    id: str
    subscription_id: str
    amount: float
    currency: str
    status: str
    invoice_pdf_url: Optional[str] = None
    invoice_date: str
    due_date: Optional[str] = None
    paid_date: Optional[str] = None
    created_at: str

    class Config:
        from_attributes = True


class StripeCheckoutSessionResponse(BaseModel):
    """Response model for Stripe Checkout Session status."""
    session_id: str
    status: str  # e.g., 'open', 'complete', 'expired'
    payment_status: str  # e.g., 'paid', 'unpaid', 'no_payment_required'
    customer_email: Optional[str] = None


@router.get("/plans", response_model=List[SubscriptionPlanResponse])
async def get_subscription_plans(
    db: Session = Depends(get_db)
):
    """
    Get all available subscription plans.
    """
    plans = SubscriptionService.get_all_plans(db)
    return plans


@router.get("/workspaces/{workspace_id}/subscription", response_model=SubscriptionResponse)
async def get_workspace_subscription(
    workspace_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get the active subscription for a workspace.
    """
    # Check if user has access to the workspace
    workspace = WorkspaceService.get_workspace_by_id(db, workspace_id)
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")
    
    if not WorkspaceService.user_has_access(db, current_user.id, workspace_id):
        raise HTTPException(status_code=403, detail="Not authorized to access this workspace")
    
    # Get active subscription
    subscription = SubscriptionService.get_active_subscription(db, workspace_id)
    if not subscription:
        raise HTTPException(status_code=404, detail="No active subscription found for this workspace")
    
    return subscription


@router.post("/workspaces/{workspace_id}/checkout")
async def create_checkout_session(
    workspace_id: str,
    plan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a Stripe checkout session for a workspace subscription.
    """
    # Check if user has access to the workspace
    workspace = WorkspaceService.get_workspace_by_id(db, workspace_id)
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")
    
    # Only the workspace owner can create a subscription
    if workspace.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the workspace owner can create a subscription")
    
    try:
        success_url = f"{settings.FRONTEND_URL}/playground/{workspace_id}?payment=success"
        checkout = StripeService.create_checkout_session(db, workspace_id, plan_id, success_url=success_url)
        return {"checkout_url": checkout["url"], "session_id": checkout["id"]}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating checkout session: {str(e)}")


@router.post("/workspaces/{workspace_id}/portal")
async def create_customer_portal_session(
    workspace_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a Stripe customer portal session for managing subscriptions.
    """
    # Check if user has access to the workspace
    workspace = WorkspaceService.get_workspace_by_id(db, workspace_id)
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")
    
    # Only the workspace owner can manage subscriptions
    if workspace.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the workspace owner can manage subscriptions")
    
    try:
        # Create portal session
        portal = StripeService.get_customer_portal_session(db, workspace_id)
        return portal
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating portal session: {str(e)}")


@router.get("/workspaces/{workspace_id}/invoices", response_model=List[InvoiceResponse])
async def get_workspace_invoices(
    workspace_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all invoices for a workspace's subscription.
    """
    # Check if user has access to the workspace
    workspace = WorkspaceService.get_workspace_by_id(db, workspace_id)
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")
    
    # Only the workspace owner can view invoices
    if workspace.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the workspace owner can view invoices")
    
    try:
        # Get the active subscription for the workspace
        subscription = SubscriptionService.get_active_subscription(db, workspace_id)
        if not subscription or not subscription.stripe_subscription_id:
            return []
        
        # Get invoices from Stripe
        stripe_invoices = stripe.Invoice.list(
            subscription=subscription.stripe_subscription_id,
            limit=100  # Limit to 100 most recent invoices
        )
        
        # Format the response
        invoices = []
        for invoice in stripe_invoices.data:
            invoices.append({
                "id": invoice.id,
                "subscription_id": subscription.stripe_subscription_id,
                "amount": float(invoice.amount_due) / 100,
                "currency": invoice.currency.upper(),
                "status": invoice.status,
                "invoice_pdf_url": invoice.invoice_pdf,
                "invoice_date": datetime.fromtimestamp(invoice.created).isoformat(),
                "due_date": datetime.fromtimestamp(invoice.due_date).isoformat() if invoice.due_date else None,
                "paid_date": datetime.fromtimestamp(invoice.status_transitions.paid_at).isoformat() \
                    if hasattr(invoice.status_transitions, 'paid_at') and invoice.status_transitions.paid_at else None,
                "created_at": datetime.fromtimestamp(invoice.created).isoformat()
            })
        
        return invoices
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=f"Stripe error: {str(e)}")
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"Error fetching invoices: {error_details}")
        raise HTTPException(status_code=500, detail=f"Error fetching invoices: {str(e)}")


@router.get("/stripe/checkout-session/{session_id}", response_model=StripeCheckoutSessionResponse, tags=["Stripe"])
async def get_stripe_checkout_session_status(session_id: str):
    """
    Retrieve the status and details of a Stripe Checkout Session.
    """
    if not settings.STRIPE_API_KEY:
        raise HTTPException(status_code=500, detail="Stripe API key not configured")
    try:
        checkout_session = stripe.checkout.Session.retrieve(session_id)
        return StripeCheckoutSessionResponse(
            session_id=checkout_session.id,
            status=checkout_session.status,
            payment_status=checkout_session.payment_status,
            customer_email=checkout_session.customer_details.email if checkout_session.customer_details else None
        )
    except stripe.error.StripeError as e:
        # Handle Stripe-specific errors (e.g., invalid session ID)
        raise HTTPException(status_code=404, detail=f"Stripe error: {str(e)}")
    except Exception as e:
        # Handle other potential errors
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/webhooks", include_in_schema=False)
async def stripe_webhook(request: Request, response: Response, db: Session = Depends(get_db)):
    """
    Handle Stripe webhook events.
    
    This endpoint receives webhook events from Stripe and processes them to update
    subscription-related data in the database. Stripe sends webhook events for various
    actions including subscription creation, updates, cancellations, and payment processing.
    
    Webhook events are processed asynchronously and errors are logged for monitoring.
    """
    # Get the webhook signature from headers
    signature = request.headers.get("stripe-signature")
    if not signature:
        print("Error: Missing Stripe signature in webhook")
        raise HTTPException(status_code=400, detail="Missing Stripe signature")
    
    # Get the webhook body
    body = await request.body()
    
    try:
        # Verify the webhook using Stripe's signature verification
        event = stripe.Webhook.construct_event(
            payload=body,
            sig_header=signature,
            secret=settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError as e:
        # Invalid payload
        print(f"Error: Invalid webhook payload - {str(e)}")
        raise HTTPException(status_code=400, detail=f"Invalid payload: {str(e)}")
    except stripe.error.SignatureVerificationError as e:
        # Invalid signature
        print(f"Error: Invalid webhook signature - {str(e)}")
        raise HTTPException(status_code=400, detail=f"Invalid signature: {str(e)}")
    except Exception as e:
        # Other unexpected errors
        print(f"Unexpected error verifying webhook: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Webhook verification failed: {str(e)}")
    
    # Log the event type for debugging
    event_type = event.get('type', 'unknown')
    event_id = event.get('id', 'unknown')
    print(f"Processing Stripe webhook event: {event_type} (ID: {event_id})")
    
    try:
        # Handle different event types
        if event_type == "checkout.session.completed":
            await handle_checkout_session_completed(event, db)
            
        # Subscription events
        elif event_type == "customer.subscription.created":
            StripeService.handle_subscription_created(db, event["data"])
            
        elif event_type in ["customer.subscription.updated", "subscription.updated"]:
            StripeService.handle_subscription_updated(db, event["data"])
            
        elif event_type in ["customer.subscription.deleted", "subscription.deleted"]:
            StripeService.handle_subscription_deleted(db, event["data"])
            
        # Invoice events
        elif event_type == "invoice.created":
            StripeService.handle_invoice_created(db, event["data"])
            
        elif event_type == "invoice.paid":
            StripeService.handle_invoice_paid(db, event["data"])
            
        elif event_type == "invoice.payment_failed":
            await handle_invoice_payment_failed(event, db)
            
        # Payment method events
        elif event_type == "payment_method.attached":
            StripeService.handle_payment_method_attached(db, event["data"])
            
        # Handle other event types
        else:
            print(f"Unhandled event type: {event_type}")
            
    except Exception as e:
        # Log the full error with traceback for debugging
        import traceback
        error_details = traceback.format_exc()
        print(f"Error processing webhook {event_type} (ID: {event_id}): {error_details}")
        
        # Log to error monitoring service if available
        # e.g., Sentry.capture_exception(e)
        
    # Always return success to acknowledge receipt of the webhook
    # This prevents Stripe from retrying the webhook
    return {"status": "success"}


async def handle_checkout_session_completed(event: Dict[str, Any], db: Session) -> None:
    """Handle checkout.session.completed webhook event."""
    session = event.get("data", {}).get("object", {})
    event_id = event.get("id", "unknown_event") # For logging
    print(f"[Webhook handle_checkout_session_completed - Event ID: {event_id}] Processing event: {event.get('type')}")

    if not session:
        print(f"[Webhook handle_checkout_session_completed - ERROR - Event ID: {event_id}] No session data in event.")
        return

    metadata = session.get("metadata")
    if not metadata:
        print(f"[Webhook handle_checkout_session_completed - ERROR - Event ID: {event_id}] No metadata in session object: {session.get('id')}")
        return

    workspace_id = metadata.get("workspace_id")
    plan_id_str = metadata.get("plan_id")

    if not workspace_id or not plan_id_str:
        print(f"[Webhook handle_checkout_session_completed - ERROR - Event ID: {event_id}] Missing workspace_id or plan_id in metadata for session: {session.get('id')}")
        return
    
    try:
        plan_id = int(plan_id_str)
    except ValueError:
        print(f"[Webhook handle_checkout_session_completed - ERROR - Event ID: {event_id}] Invalid plan_id format in metadata: {plan_id_str} for session: {session.get('id')}")
        return

    print(f"[Webhook handle_checkout_session_completed - Event ID: {event_id}] Extracted metadata: workspace_id={workspace_id}, plan_id={plan_id}")

    existing_plan = SubscriptionService.get_plan_by_id(db, plan_id)
    if not existing_plan:
        print(f"[Webhook handle_checkout_session_completed - ERROR - Event ID: {event_id}] Plan with ID {plan_id} not found. Cannot create subscription.")
        return

    existing_subscription = db.query(DBSubscription).filter(
        DBSubscription.workspace_id == workspace_id,
    ).order_by(DBSubscription.created_at.desc()).first()

    stripe_subscription_id_from_session = session.get("subscription")
    if stripe_subscription_id_from_session:
        existing_subscription_by_stripe_id = db.query(DBSubscription).filter(
            DBSubscription.stripe_subscription_id == stripe_subscription_id_from_session
        ).first()
        if existing_subscription_by_stripe_id:
            print(f"[Webhook handle_checkout_session_completed - Event ID: {event_id}] Subscription with Stripe ID {stripe_subscription_id_from_session} (from session.subscription) already exists. Fallback creation skipped.")
            return
    elif existing_subscription and existing_subscription.status == SubscriptionStatus.ACTIVE.value:
        print(f"[Webhook handle_checkout_session_completed - Event ID: {event_id}] An active subscription already exists for workspace {workspace_id}. Fallback creation skipped.")
        return

    if not existing_subscription or not (stripe_subscription_id_from_session and existing_subscription_by_stripe_id):
        print(f"[Webhook handle_checkout_session_completed - Event ID: {event_id}] Attempting to create subscription from checkout session for workspace {workspace_id}")
        try:
            if not stripe_subscription_id_from_session:
                print(f"[Webhook handle_checkout_session_completed - WARNING - Event ID: {event_id}] No 'subscription' field in checkout session object: {session.get('id')}. Cannot create subscription.")
                return
                
            # It's better to use the data from the subscription object if available,
            # as `checkout.session.completed` might not have all final details.
            # However, the primary creation should be via `customer.subscription.created`.
            # This path is truly a last resort.
            stripe_sub = stripe.Subscription.retrieve(stripe_subscription_id_from_session)
            
            # Final check for idempotency with the retrieved stripe_sub ID
            final_check_sub = db.query(DBSubscription).filter(DBSubscription.stripe_subscription_id == stripe_sub.id).first()
            if final_check_sub:
                print(f"[Webhook handle_checkout_session_completed - Event ID: {event_id}] Subscription with Stripe ID {stripe_sub.id} (retrieved) already exists. Fallback creation skipped.")
                return

            subscription_data = {
                "workspace_id": workspace_id,
                "plan_id": plan_id,
                "status": stripe_sub.status, # Use status from the retrieved subscription
                "stripe_subscription_id": stripe_sub.id,
                "start_date": datetime.fromtimestamp(stripe_sub["items"]["data"][0]["current_period_start"]),
                "end_date": datetime.fromtimestamp(stripe_sub["items"]["data"][0]["current_period_end"])
            }
            print(f"[Webhook handle_checkout_session_completed - Event ID: {event_id}] Creating subscription with data: {subscription_data}")
            # Use the SubscriptionService.create_subscription method for consistency if it's safe
            # For now, direct creation as per original code, but ensure it's correct
            new_subscription = DBSubscription(**subscription_data) # Create model instance
            db.add(new_subscription)
            db.commit()
            print(f"[Webhook handle_checkout_session_completed - Event ID: {event_id}] Successfully created subscription {new_subscription.id} from checkout session.")
        except Exception as e:
            db.rollback()
            print(f"[Webhook handle_checkout_session_completed - ERROR - Event ID: {event_id}] Error creating subscription from checkout session: {str(e)}")
            import traceback
            traceback.print_exc()
            # Do not re-raise here to prevent Stripe from retrying this fallback path indefinitely if the main path fails.
            # Errors here suggest a more fundamental issue or that the main path should have worked.
