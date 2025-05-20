"""
Database models for the AI-UGC platform.

This file contains all SQLAlchemy ORM models for the application database.
"""

import enum
import uuid
from datetime import datetime, timedelta
from sqlalchemy import (
    Boolean, Column, DateTime, ForeignKey, Integer, String, Text, Table, JSON, Float, ARRAY, event
)
from sqlalchemy.orm import relationship, Session
from app.db.database import Base


# ----------------
# Utility Functions
# ----------------

def generate_uuid():
    """Generate a unique UUID for asset identification."""
    return str(uuid.uuid4())

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
    
    # Relationship placeholders (nullable for now)
    user_id = Column(String, nullable=True)
    workspace_id = Column(String, nullable=True)
    
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
# Video Generation Models (DEPRECATED)
# ----------------

# NOTE: The following models are deprecated and will be removed in a future update.
# The videos table (Video model) should be used instead for all video generation.

class VideoGeneration(Base):
    """
    DEPRECATED: Video generation model.
    This model is deprecated and will be removed. Use the Video model instead.
    """
    
    __tablename__ = "video_generations"
    
    id = Column(Integer, primary_key=True, index=True)
    generation_id = Column(String(100), unique=True, index=True, nullable=False)
    prompt = Column(Text, nullable=False)
    status = Column(String(20), default=VideoStatus.PROCESSING.value, nullable=False)
    model = Column(String(50), nullable=False)
    duration = Column(String(20), nullable=False)
    aspect_ratio = Column(String(10), nullable=False)
    provider = Column(String(50), nullable=False)
    
    # URLs and metadata
    video_url = Column(String(2000), nullable=True)
    preview_url = Column(String(2000), nullable=True)
    thumbnail_url = Column(String(2000), nullable=True)
    metadata_json = Column(JSON, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.now, nullable=False)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now, nullable=False)
    completed_at = Column(DateTime, nullable=True)
    
    # Relationship with avatar videos
    heygen_avatar_videos = relationship("HeygenAvatarVideo", back_populates="video_generation")
    
    def __repr__(self):
        """String representation of the video generation."""
        return f"<VideoGeneration {self.generation_id}: {self.status}>"


class HeygenAvatarVideo(Base):
    """
    DEPRECATED: Heygen avatar video model for tracking avatar video generations.
    This model is deprecated and will be removed. Use the Video model instead.
    """
    
    __tablename__ = "heygen_avatar_videos"
    
    id = Column(Integer, primary_key=True, index=True)
    video_generation_id = Column(Integer, ForeignKey("video_generations.id"), nullable=False)
    
    # Avatar details
    avatar_id = Column(String(100), nullable=False, index=True)
    avatar_name = Column(String(100), nullable=True)
    avatar_style = Column(String(50), default="normal", nullable=False)
    
    # Voice details
    voice_id = Column(String(100), nullable=False)
    voice_speed = Column(Float, default=1.0, nullable=False)
    voice_pitch = Column(Integer, default=0, nullable=False)
    
    # Video settings
    width = Column(Integer, default=1280, nullable=False)
    height = Column(Integer, default=720, nullable=False)
    background_color = Column(String(20), default="#f6f6fc", nullable=False)
    
    # Performance metrics
    processing_time = Column(Float, nullable=True)  # Time taken to generate the video in seconds
    
    # Additional metadata
    gender = Column(String(20), nullable=True)
    language = Column(String(50), nullable=True)
    callback_url = Column(String(500), nullable=True)
    error_details = Column(JSON, nullable=True)  # For storing error information if generation fails
    
    # Relationship with base video generation
    video_generation = relationship("VideoGeneration", back_populates="heygen_avatar_videos")
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.now, nullable=False)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now, nullable=False)
    
    def __repr__(self):
        """String representation of the Heygen avatar video."""
        return f"<HeygenAvatarVideo {self.id}: {self.avatar_id}>"

# ----------------
# User and Workspace Models
# ----------------

class UserWorkspace(Base):
    __tablename__ = "user_workspaces"
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    workspace_id = Column(Integer, ForeignKey("workspaces.id"), primary_key=True)
    role = Column(String(50), nullable=False, default="member")
    active = Column(Boolean, nullable=False, default=False)
    joined_at = Column(DateTime, default=datetime.now, nullable=False)

    user = relationship("User", back_populates="user_workspaces")
    workspace = relationship("Workspace", back_populates="user_workspaces")
    
    def __repr__(self):
        return f"<UserWorkspace user_id={self.user_id} workspace_id={self.workspace_id} role={self.role}>"

class Workspace(Base):
    __tablename__ = "workspaces"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    type = Column(String(50), nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.now, nullable=False)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now, nullable=False)
    
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

    def __repr__(self):
        return f"<Workspace {self.id}: {self.name}>"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
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