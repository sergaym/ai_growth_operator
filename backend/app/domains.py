"""
Domain concepts for the AI-UGC platform.

This file re-exports domain concepts from the models.py file
for backward compatibility with services.
"""

from app.models import VideoStatus

__all__ = [
    "VideoStatus"
] 