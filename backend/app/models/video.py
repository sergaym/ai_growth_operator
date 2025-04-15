"""
Database models for video generation.
"""

import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, Enum, JSON, Float, ForeignKey
from sqlalchemy.orm import relationship

from app.db.database import Base


class VideoStatus(str, enum.Enum):
    """Status of a video generation."""
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class VideoGeneration(Base):
    """Video generation model."""
    
    __tablename__ = "video_generations"
    
    id = Column(Integer, primary_key=True, index=True)
    generation_id = Column(String(100), unique=True, index=True, nullable=False)
    prompt = Column(Text, nullable=False)
    status = Column(Enum(VideoStatus), default=VideoStatus.PROCESSING, nullable=False)
    model = Column(String(50), nullable=False)
    duration = Column(String(20), nullable=False)
    aspect_ratio = Column(String(10), nullable=False)
    provider = Column(String(50), nullable=False)
    
    # URLs and metadata
    video_url = Column(String(500), nullable=True)
    preview_url = Column(String(500), nullable=True)
    thumbnail_url = Column(String(500), nullable=True)
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