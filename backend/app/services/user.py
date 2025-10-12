from datetime import datetime
from typing import Optional

from sqlmodel import Session, select

from app.models.user import User
from app.schemas.user import UserCreate
from app.services.auth import get_password_hash, verify_password
from app.services.user_settings import UserSettingsService


class UserService:
    """Service for user-related database operations."""

    @staticmethod
    def create_user(db: Session, user_create: UserCreate) -> User:
        """Create a new user."""
        hashed_password = get_password_hash(user_create.password)

        db_user = User(username=user_create.username, hashed_password=hashed_password)

        db.add(db_user)
        db.commit()
        db.refresh(db_user)

        # Create default user settings using the settings service
        UserSettingsService.create_default_settings(db, db_user.id)

        return db_user

    @staticmethod
    def get_user_by_username(db: Session, username: str) -> Optional[User]:
        """Get user by username."""
        statement = select(User).where(User.username == username)
        return db.exec(statement).first()

    @staticmethod
    def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
        """Get user by ID."""
        statement = select(User).where(User.id == user_id)
        return db.exec(statement).first()

    @staticmethod
    def authenticate_user(db: Session, username: str, password: str) -> Optional[User]:
        """Authenticate a user by username and password."""
        user = UserService.get_user_by_username(db, username)

        if not user or not verify_password(password, user.hashed_password):
            return None

        return user
