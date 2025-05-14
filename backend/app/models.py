"""
Database models for the AI-UGC platform.

This file contains all SQLAlchemy ORM models for the application database.
"""

import enum
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, DateTime, Text, JSON, ForeignKey, Boolean, Table
from sqlalchemy.orm import relationship

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
# Video Generation Models
# ----------------

class VideoGeneration(Base):
    """Video generation model."""
    
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
    """Heygen avatar video model for tracking avatar video generations."""
    
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
class Workspace(Base):
    __tablename__ = "workspaces"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    type = Column(String(50), nullable=False)
    users = relationship("User", back_populates="workspaces", secondary="user_workspaces")

    def __repr__(self):
        return f"<Workspace {self.id}: {self.name}>"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=False)
    role = Column(String(50), nullable=True)
    workspaces = relationship("Workspace", back_populates="users", secondary="user_workspaces")

    def __repr__(self):
        return f"<User {self.id}: {self.email}>"

# Association table for many-to-many relationship between users and workspaces
user_workspaces = Table(
    "user_workspaces",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True),
    Column("workspace_id", Integer, ForeignKey("workspaces.id"), primary_key=True)
)