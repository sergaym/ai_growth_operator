"""
Database models for video generation.
"""

import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, Enum, JSON

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
    metadata = Column(JSON, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.now, nullable=False)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now, nullable=False)
    completed_at = Column(DateTime, nullable=True)
    
    def __repr__(self):
        """String representation of the video generation."""
        return f"<VideoGeneration {self.generation_id}: {self.status}>" 