"""
Database models for the application.

This module imports all database models to ensure they are registered
with SQLModel for Alembic migrations.
"""

from app.models.epigram import Epigram
from app.models.user import User, UserSettings

__all__ = ["Epigram", "User", "UserSettings"]
