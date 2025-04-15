from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, ForeignKey, 
    DateTime, JSON
)
from sqlalchemy.orm import relationship

from backend.database.base import Base


class HeyGenAvatarVideo(Base):
    """
    Model representing a HeyGen avatar video generation.
    """
    __tablename__ = "heygen_avatar_videos"

    id = Column(Integer, primary_key=True)
    video_generation_id = Column(Integer, ForeignKey("video_generations.id"), nullable=False)
    avatar_id = Column(String(100), nullable=False, index=True)
    avatar_name = Column(String(100), nullable=True)
    avatar_style = Column(String(50), nullable=False)
    voice_id = Column(String(100), nullable=False)
    voice_speed = Column(Float, nullable=False)
    voice_pitch = Column(Integer, nullable=False)
    width = Column(Integer, nullable=False)
    height = Column(Integer, nullable=False)
    background_color = Column(String(20), nullable=False)
    processing_time = Column(Float, nullable=True)
    gender = Column(String(20), nullable=True)
    language = Column(String(50), nullable=True)
    callback_url = Column(String(500), nullable=True)
    error_details = Column(JSON, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship to parent video generation
    video_generation = relationship("VideoGeneration", back_populates="heygen_avatar_video")

    def __init__(
        self,
        video_generation_id,
        avatar_id,
        avatar_style,
        voice_id,
        voice_speed,
        voice_pitch,
        width,
        height,
        background_color,
        avatar_name=None,
        processing_time=None,
        gender=None,
        language=None,
        callback_url=None,
        error_details=None,
    ):
        self.video_generation_id = video_generation_id
        self.avatar_id = avatar_id
        self.avatar_name = avatar_name
        self.avatar_style = avatar_style
        self.voice_id = voice_id
        self.voice_speed = voice_speed
        self.voice_pitch = voice_pitch
        self.width = width
        self.height = height
        self.background_color = background_color
        self.processing_time = processing_time
        self.gender = gender
        self.language = language
        self.callback_url = callback_url
        self.error_details = error_details
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()

    def to_dict(self):
        """Convert object to dictionary."""
        return {
            "id": self.id,
            "video_generation_id": self.video_generation_id,
            "avatar_id": self.avatar_id,
            "avatar_name": self.avatar_name,
            "avatar_style": self.avatar_style,
            "voice_id": self.voice_id,
            "voice_speed": self.voice_speed,
            "voice_pitch": self.voice_pitch,
            "width": self.width,
            "height": self.height,
            "background_color": self.background_color,
            "processing_time": self.processing_time,
            "gender": self.gender,
            "language": self.language,
            "callback_url": self.callback_url,
            "error_details": self.error_details,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        } 