"""
Database models for the AI-UGC platform.

This file contains all SQLAlchemy ORM models for the application database.
"""

import enum
import uuid
from datetime import datetime, timedelta
from sqlalchemy import (
    Boolean, Column, DateTime, ForeignKey, Integer, String, Text, Table, JSON, Float, ARRAY, event, Numeric
)
from sqlalchemy.orm import relationship, Session
from app.db.database import Base


# ----------------
# Utility Functions
# ----------------

def generate_uuid():
    return str(uuid.uuid4().hex)

# ----------------
# Enum Definitions
# ----------------

class VideoStatus(str, enum.Enum):
    """Status of a video generation."""
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    
    @classmethod
    def as_value(cls, status):
        """
        Ensures that a status is always used as its string value.
        This helps avoid issues with enum serialization in the database.
        
        Args:
            status: Either a VideoStatus enum or a string
            
        Returns:
            The string value of the status
        """
        if isinstance(status, cls):
            return status.value
        return status
    
    @classmethod
    def from_string(cls, status_str):
        """
        Convert a string status to the corresponding enum member.
        
        Args:
            status_str: A string representing a status
            
        Returns:
            The corresponding VideoStatus enum member
        """
        for status in cls:
            if status.value == status_str:
                return status
        raise ValueError(f"Invalid status: {status_str}")

# ----------------
# Base Asset Models
# ----------------

class BaseAsset(Base):
    """Base model for all asset types."""
    __abstract__ = True
    
    id = Column(String, primary_key=True, default=generate_uuid)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Asset storage info
    file_path = Column(String)
    file_url = Column(String)
    local_url = Column(String)
    blob_url = Column(String)
    
    # Relationship placeholders (with proper foreign key constraints)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    workspace_id = Column(String, ForeignKey("workspaces.id"), nullable=True)
    project_id = Column(String, ForeignKey("projects.id"), nullable=True)
    
    # Status and metadata
    status = Column(String, default="completed")
    is_public = Column(Boolean, default=True)
    metadata_json = Column(JSON, nullable=True)

# ----------------
# Media Asset Models
# ----------------

class Image(BaseAsset):
    """Model for AI-generated images."""
    __tablename__ = "images"
    
    # Generation parameters
    prompt = Column(Text)
    negative_prompt = Column(Text, nullable=True)
    guidance_scale = Column(Float, nullable=True)
    num_inference_steps = Column(Integer, nullable=True)
    
    # Image metadata
    width = Column(Integer, nullable=True)
    height = Column(Integer, nullable=True)
    image_format = Column(String, nullable=True)
    
    # Linked Videos
    videos = relationship("Video", back_populates="source_image")


class Video(BaseAsset):
    """Model for AI-generated videos."""
    __tablename__ = "videos"
    
    # Generation parameters
    prompt = Column(Text, nullable=True)
    duration = Column(String)
    aspect_ratio = Column(String)
    cfg_scale = Column(Float, nullable=True)
    
    # Video metadata
    preview_image_url = Column(String, nullable=True)
    
    # Source image relationship (optional)
    source_image_id = Column(String, ForeignKey("images.id"), nullable=True)
    source_image = relationship("Image", back_populates="videos")
    
    # Lipsync videos using this video
    lipsync_videos = relationship("LipsyncVideo", foreign_keys="[LipsyncVideo.video_id]", back_populates="video")


class Audio(BaseAsset):
    """Model for AI-generated audio."""
    __tablename__ = "audio"
    
    # Generation parameters
    text = Column(Text)
    voice_id = Column(String)
    voice_name = Column(String, nullable=True)
    model_id = Column(String)
    language = Column(String, nullable=True)
    
    # Audio metadata
    duration_seconds = Column(Float, nullable=True)
    audio_format = Column(String, nullable=True)
    
    # Lipsync videos using this audio
    lipsync_videos = relationship("LipsyncVideo", foreign_keys="[LipsyncVideo.audio_id]", back_populates="audio")


class LipsyncVideo(BaseAsset):
    """Model for AI-generated lipsync videos."""
    __tablename__ = "lipsync_videos"
    
    # Source relationships
    video_id = Column(String, ForeignKey("videos.id"), nullable=True)
    audio_id = Column(String, ForeignKey("audio.id"), nullable=True)
    
    video = relationship("Video", foreign_keys=[video_id], back_populates="lipsync_videos")
    audio = relationship("Audio", foreign_keys=[audio_id], back_populates="lipsync_videos")



# ----------------
# User and Workspace Models
# ----------------

class UserWorkspace(Base):
    __tablename__ = "user_workspaces"
    user_id = Column(String, ForeignKey("users.id"), primary_key=True)
    workspace_id = Column(String, ForeignKey("workspaces.id"), primary_key=True)
    role = Column(String(50), nullable=False, default="member")
    active = Column(Boolean, nullable=False, default=False)
    joined_at = Column(DateTime, default=datetime.now, nullable=False)

    user = relationship("User", back_populates="user_workspaces")
    workspace = relationship("Workspace", back_populates="user_workspaces")
    
    def __repr__(self):
        return f"<UserWorkspace user_id={self.user_id} workspace_id={self.workspace_id} role={self.role}>"

class Workspace(Base):
    __tablename__ = "workspaces"
    id = Column(String, primary_key=True, index=True, default=generate_uuid)
    name = Column(String(100), nullable=False)
    type = Column(String(50), nullable=False)
    owner_id = Column(String, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.now, nullable=False)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now, nullable=False)
    
    # Subscription related fields
    stripe_customer_id = Column(String(255), nullable=True)
    
    owner = relationship("User", back_populates="owned_workspaces", foreign_keys=[owner_id])
    user_workspaces = relationship(
        "UserWorkspace", 
        back_populates="workspace", 
        cascade="all, delete-orphan",
        overlaps="users,user_workspaces"
    )
    users = relationship(
        "User", 
        secondary="user_workspaces", 
        back_populates="workspaces",
        viewonly=True,
        overlaps="user_workspaces,workspace"
    )
    # Subscription relationship
    subscriptions = relationship("Subscription", back_populates="workspace", cascade="all, delete-orphan")
    # Current active subscription
    active_subscription = relationship(
        "Subscription",
        primaryjoin="and_(Workspace.id==Subscription.workspace_id, Subscription.status=='active')",
        viewonly=True,
        uselist=False
    )
    # Projects relationship
    projects = relationship("Project", back_populates="workspace", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Workspace {self.id}: {self.name}>"

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, index=True, default=generate_uuid)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.now, nullable=False)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now, nullable=False)
    
    user_workspaces = relationship(
        "UserWorkspace", 
        back_populates="user", 
        cascade="all, delete-orphan",
        overlaps="workspaces,user_workspaces"
    )
    workspaces = relationship(
        "Workspace", 
        secondary="user_workspaces", 
        back_populates="users",
        viewonly=True,
        overlaps="user_workspaces,user"
    )
    owned_workspaces = relationship(
        "Workspace", 
        back_populates="owner", 
        foreign_keys="[Workspace.owner_id]"
    )
    created_projects = relationship("Project", back_populates="created_by")

    def __repr__(self):
        return f"<User {self.id}: {self.email}>"

# ----------------
# Listeners
# ----------------

def create_personal_workspace(mapper, connection, target):
    """Create a personal workspace for a new user."""
    # Use the connection to execute raw SQL to avoid session flushing issues
    from sqlalchemy.sql import text
    
    # Insert workspace with timestamps
    current_time = datetime.now()
    result = connection.execute(
        text("""
            INSERT INTO workspaces (name, type, owner_id, created_at, updated_at)
            VALUES (:name, :type, :owner_id, :created_at, :updated_at)
            RETURNING id
        """),
        {
            "name": "Personal Workspace",
            "type": "personal",
            "owner_id": target.id,
            "created_at": current_time,
            "updated_at": current_time
        }
    )
    workspace_id = result.fetchone()[0]
    
    # Insert user_workspace association
    connection.execute(
        text("""
            INSERT INTO user_workspaces (user_id, workspace_id, role, active, joined_at)
            VALUES (:user_id, :workspace_id, :role, :active, :joined_at)
        """),
        {"user_id": target.id, "workspace_id": workspace_id, "role": "owner", "active": True, "joined_at": current_time}
    )

# Set up the event listener for after a User is inserted
event.listen(User, 'after_insert', create_personal_workspace)


# ----------------
# Project Models
# ----------------

class ProjectStatus(str, enum.Enum):
    """Status of a project."""
    DRAFT = "draft"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    ARCHIVED = "archived"


class Project(Base):
    """Model for projects within workspaces."""
    __tablename__ = "projects"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    workspace_id = Column(String, ForeignKey("workspaces.id"), nullable=False)
    created_by_user_id = Column(String, ForeignKey("users.id"), nullable=False)
    status = Column(String(20), default=ProjectStatus.DRAFT.value, nullable=False)
    thumbnail_url = Column(String, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.now, nullable=False)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now, nullable=False)
    last_activity_at = Column(DateTime, default=datetime.now, nullable=False)
    
    # Metadata
    metadata_json = Column(JSON, nullable=True)
    
    # Relationships
    workspace = relationship("Workspace", back_populates="projects")
    created_by = relationship("User", back_populates="created_projects")
    
    def update_activity(self):
        """Update the last activity timestamp."""
        self.last_activity_at = datetime.now()
    
    def __repr__(self):
        return f"<Project {self.id}: {self.name} ({self.status})>"


# ----------------
# Subscription Models
# ----------------

class SubscriptionPlan(Base):
    """Model for subscription plan tiers."""
    __tablename__ = "subscription_plans"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Numeric(10, 2), nullable=False)  # Monthly price
    currency = Column(String(3), default="USD", nullable=False)
    billing_interval = Column(String(20), default="month", nullable=False)  # month, year, etc.
    
    # Stripe product and price IDs
    stripe_product_id = Column(String(255), nullable=True)
    stripe_price_id = Column(String(255), nullable=True)
    
    # Plan features/limits - only max_users as per requirements
    max_users = Column(Integer, nullable=False)  # Main differentiator between tiers
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.now, nullable=False)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now, nullable=False)
    
    # Relationships
    subscriptions = relationship("Subscription", back_populates="plan")
    
    def __repr__(self):
        return f"<SubscriptionPlan {self.id}: {self.name} (${self.price}/{self.billing_interval})>"


class SubscriptionStatus(str, enum.Enum):
    """Status of a subscription."""
    ACTIVE = "active"
    PAST_DUE = "past_due"
    CANCELED = "canceled"
    UNPAID = "unpaid"
    TRIALING = "trialing"
    EXPIRED = "expired"


class Subscription(Base):
    """Model for workspace subscriptions."""
    __tablename__ = "subscriptions"
    
    id = Column(Integer, primary_key=True, index=True)
    workspace_id = Column(String, ForeignKey("workspaces.id"), nullable=False)
    plan_id = Column(Integer, ForeignKey("subscription_plans.id"), nullable=False)
    
    # Current status
    status = Column(String(20), default=SubscriptionStatus.ACTIVE.value, nullable=False)
    
    # Stripe subscription ID
    stripe_subscription_id = Column(String(255), nullable=True)
    
    # Dates
    start_date = Column(DateTime, default=datetime.now, nullable=False)
    end_date = Column(DateTime, nullable=True)  # When subscription will end or has ended
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.now, nullable=False)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now, nullable=False)
    canceled_at = Column(DateTime, nullable=True)
    
    # Metadata
    metadata_json = Column(JSON, nullable=True)
    
    # Relationships
    workspace = relationship("Workspace", back_populates="subscriptions")
    plan = relationship("SubscriptionPlan", back_populates="subscriptions")
    invoices = relationship("Invoice", back_populates="subscription", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Subscription {self.id}: {self.workspace_id} on plan {self.plan_id} ({self.status})>"


class PaymentMethod(Base):
    """Model for stored payment methods."""
    __tablename__ = "payment_methods"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    workspace_id = Column(String, ForeignKey("workspaces.id"), nullable=False)
    
    # Card details (stored in a PCI-compliant way)
    type = Column(String(20), nullable=False)  # card, sepa, etc.
    last4 = Column(String(4), nullable=True)  # Last 4 digits of card
    brand = Column(String(20), nullable=True)  # visa, mastercard, etc.
    exp_month = Column(Integer, nullable=True)
    exp_year = Column(Integer, nullable=True)
    
    # Stripe payment method ID
    stripe_payment_method_id = Column(String(255), nullable=True)
    is_default = Column(Boolean, default=False, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.now, nullable=False)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now, nullable=False)
    
    # Relationships
    user = relationship("User")
    workspace = relationship("Workspace")
    
    def __repr__(self):
        return f"<PaymentMethod {self.id}: {self.type} **** {self.last4} ({self.brand})>"


class InvoiceStatus(str, enum.Enum):
    """Status of an invoice."""
    DRAFT = "draft"
    OPEN = "open"
    PAID = "paid"
    UNCOLLECTIBLE = "uncollectible"
    VOID = "void"


class Invoice(Base):
    """Model for subscription invoices."""
    __tablename__ = "invoices"
    
    id = Column(Integer, primary_key=True, index=True)
    subscription_id = Column(Integer, ForeignKey("subscriptions.id"), nullable=False)
    workspace_id = Column(String, ForeignKey("workspaces.id"), nullable=False)
    
    # Invoice details
    amount = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(3), default="USD", nullable=False)
    status = Column(String(20), default=InvoiceStatus.DRAFT.value, nullable=False)
    
    # Stripe invoice ID
    stripe_invoice_id = Column(String(255), nullable=True)
    
    # PDF URL of invoice
    invoice_pdf_url = Column(String(255), nullable=True)
    
    # Dates
    invoice_date = Column(DateTime, default=datetime.now, nullable=False)
    due_date = Column(DateTime, nullable=True)
    paid_date = Column(DateTime, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.now, nullable=False)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now, nullable=False)
    
    # Metadata
    metadata_json = Column(JSON, nullable=True)
    
    # Relationships
    subscription = relationship("Subscription", back_populates="invoices")
    workspace = relationship("Workspace")
    
    def __repr__(self):
        return f"<Invoice {self.id}: {self.workspace_id} amount {self.amount} {self.currency} ({self.status})>"