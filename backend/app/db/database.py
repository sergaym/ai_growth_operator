"""
Database configuration and utility functions.
"""

import logging
from typing import Optional, TypeVar, Type, Any, Generator

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

from app.core.config import settings

