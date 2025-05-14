"""
Domain models package.

This package re-exports domain models from the centralized models.py file
for backward compatibility.
"""

from app.models import VideoStatus

__all__ = [
    "VideoStatus"
] 