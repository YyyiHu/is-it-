from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.models.user import User
from app.schemas.user import UserCreate
from app.services.auth import get_password_hash, verify_password
from app.services.user_settings import UserSettingsService


class UserService:
    """Service for user-related database operations."""

    @staticmethod
    async def create_user(db: AsyncSession, user_create: UserCreate) -> User:
        """Create a new user."""
        hashed_password = get_password_hash(user_create.password)

        db_user = User(username=user_create.username, hashed_password=hashed_password)

        db.add(db_user)
        await db.commit()
        await db.refresh(db_user)

        # Create default user settings
        await UserSettingsService.create_default_settings(db, db_user.id)

        return db_user

    @staticmethod
    async def get_user_by_username(db: AsyncSession, username: str) -> Optional[User]:
        """Get user by username."""
        statement = select(User).where(User.username == username)
        result = await db.execute(statement)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_user_by_id(db: AsyncSession, user_id: int) -> Optional[User]:
        """Get user by ID."""
        statement = select(User).where(User.id == user_id)
        result = await db.execute(statement)
        return result.scalar_one_or_none()

    @staticmethod
    async def authenticate_user(db: AsyncSession, username: str, password: str) -> Optional[User]:
        """Authenticate a user by username and password."""
        user = await UserService.get_user_by_username(db, username)

        if not user or not verify_password(password, user.hashed_password):
            return None

        return user
