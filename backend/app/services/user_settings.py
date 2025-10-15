from datetime import datetime
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.models.user import UserSettings
from app.schemas.user import UserSettingsCreate, UserSettingsUpdate


class UserSettingsService:
    """Service for user settings-related database operations."""

    @staticmethod
    async def get_user_settings(db: AsyncSession, user_id: int) -> Optional[UserSettings]:
        """Get user settings by user ID."""
        statement = select(UserSettings).where(UserSettings.user_id == user_id)
        result = await db.execute(statement)
        return result.scalar_one_or_none()

    @staticmethod
    async def create_user_settings(
        db: AsyncSession, user_id: int, settings: UserSettingsCreate
    ) -> UserSettings:
        """Create user settings."""
        db_settings = UserSettings(
            user_id=user_id,
            auto_reload_enabled=settings.auto_reload_enabled,
            auto_reload_interval_minutes=settings.auto_reload_interval_minutes,
        )

        db.add(db_settings)
        await db.commit()
        await db.refresh(db_settings)
        return db_settings

    @staticmethod
    async def create_default_settings(db: AsyncSession, user_id: int) -> UserSettings:
        """Create default user settings."""
        db_settings = UserSettings(
            user_id=user_id, auto_reload_enabled=False, auto_reload_interval_minutes=5
        )

        db.add(db_settings)
        await db.flush()
        await db.refresh(db_settings)
        return db_settings

    @staticmethod
    async def update_user_settings(
        db: AsyncSession, user_id: int, settings: UserSettingsUpdate
    ) -> Optional[UserSettings]:
        """Update user settings."""
        statement = select(UserSettings).where(UserSettings.user_id == user_id)
        result = await db.execute(statement)
        db_settings = result.scalar_one_or_none()

        if not db_settings:
            return None

        if settings.auto_reload_enabled is not None:
            db_settings.auto_reload_enabled = settings.auto_reload_enabled

        if settings.auto_reload_interval_minutes is not None:
            db_settings.auto_reload_interval_minutes = (
                settings.auto_reload_interval_minutes
            )

        db_settings.updated_at = datetime.utcnow()

        db.add(db_settings)
        await db.commit()
        await db.refresh(db_settings)
        return db_settings

    @staticmethod
    async def delete_user_settings(db: AsyncSession, user_id: int) -> bool:
        """Delete user settings."""
        statement = select(UserSettings).where(UserSettings.user_id == user_id)
        result = await db.execute(statement)
        db_settings = result.scalar_one_or_none()

        if not db_settings:
            return False

        await db.delete(db_settings)
        await db.commit()
        return True
