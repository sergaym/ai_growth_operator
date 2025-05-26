from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional, Dict, Any
from enum import Enum
from decimal import Decimal

# ----------------
# Subscription Enums
# ----------------

class SubscriptionStatus(str, Enum):
    ACTIVE = "active"
    PAST_DUE = "past_due"
    CANCELED = "canceled"
    UNPAID = "unpaid"
    TRIALING = "trialing"
    EXPIRED = "expired"

class InvoiceStatus(str, Enum):
    DRAFT = "draft"
    OPEN = "open"
    PAID = "paid"
    UNCOLLECTIBLE = "uncollectible"
    VOID = "void"

# ----------------
# Subscription Schemas
# ----------------

class SubscriptionPlan(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    price: Decimal
    currency: str = "USD"
    billing_interval: str = "month"
    stripe_product_id: Optional[str] = None
    stripe_price_id: Optional[str] = None
    max_users: int
    created_at: datetime
    updated_at: datetime

class Subscription(BaseModel):
    id: int
    workspace_id: str
    plan_id: int
    status: SubscriptionStatus
    stripe_subscription_id: Optional[str] = None
    start_date: datetime
    end_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    canceled_at: Optional[datetime] = None
    metadata_json: Optional[Dict[str, Any]] = None

class PaymentMethod(BaseModel):
    id: int
    user_id: int
    workspace_id: str
    type: str
    last4: Optional[str] = None
    brand: Optional[str] = None
    exp_month: Optional[int] = None
    exp_year: Optional[int] = None
    stripe_payment_method_id: Optional[str] = None
    is_default: bool = False
    created_at: datetime
    updated_at: datetime

class Invoice(BaseModel):
    id: int
    subscription_id: int
    workspace_id: str
    amount: Decimal
    currency: str = "USD"
    status: InvoiceStatus
    stripe_invoice_id: Optional[str] = None
    invoice_pdf_url: Optional[str] = None
    invoice_date: datetime
    due_date: Optional[datetime] = None
    paid_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    metadata_json: Optional[Dict[str, Any]] = None

# ----------------
# Response Models
# ----------------

class SubscriptionPlanResponse(SubscriptionPlan):
    model_config = ConfigDict(from_attributes=True)

class SubscriptionResponse(Subscription):
    plan: SubscriptionPlanResponse
    model_config = ConfigDict(from_attributes=True)

class PaymentMethodResponse(PaymentMethod):
    model_config = ConfigDict(from_attributes=True)

class InvoiceResponse(Invoice):
    subscription: SubscriptionResponse
    model_config = ConfigDict(from_attributes=True)

# ----------------
# Extended Response Models
# ----------------

# Import WorkspaceResponse from workspace_schemas to avoid circular imports
from .workspace_schemas import WorkspaceResponse

class WorkspaceWithSubscriptionResponse(WorkspaceResponse):
    active_subscription: Optional[SubscriptionResponse] = None
    model_config = ConfigDict(from_attributes=True) 