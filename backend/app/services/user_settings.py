from datetime import datetime
from typing import Optional

from sqlmodel import Session, select

from app.models.user import UserSettings
from app.schemas.user import UserSettingsCreate, UserSettingsUpdate


class UserSettingsService:
    """Service for user settings-related database operations."""

    @staticmethod
    def get_user_settings(db: Session, user_id: int) -> Optional[UserSettings]:
        """Get user settings by user ID."""
        statement = select(UserSettings).where(UserSettings.user_id == user_id)
        return db.exec(statement).first()

    @staticmethod
    def create_user_settings(
        db: Session, user_id: int, settings: UserSettingsCreate
    ) -> UserSettings:
        """Create user settings."""
        db_settings = UserSettings(
            user_id=user_id,
            auto_reload_enabled=settings.auto_reload_enabled,
            auto_reload_interval_minutes=settings.auto_reload_interval_minutes,
        )

        db.add(db_settings)
        db.commit()
        db.refresh(db_settings)
        return db_settings

    @staticmethod
    def create_default_settings(db: Session, user_id: int) -> UserSettings:
        """Create default user settings."""
        db_settings = UserSettings(
            user_id=user_id, auto_reload_enabled=False, auto_reload_interval_minutes=5
        )

        db.add(db_settings)
        db.commit()
        db.refresh(db_settings)
        return db_settings

    @staticmethod
    def update_user_settings(
        db: Session, user_id: int, settings: UserSettingsUpdate
    ) -> Optional[UserSettings]:
        """Update user settings."""
        statement = select(UserSettings).where(UserSettings.user_id == user_id)
        db_settings = db.exec(statement).first()

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
        db.commit()
        db.refresh(db_settings)
        return db_settings

    @staticmethod
    def delete_user_settings(db: Session, user_id: int) -> bool:
        """Delete user settings."""
        statement = select(UserSettings).where(UserSettings.user_id == user_id)
        db_settings = db.exec(statement).first()

        if not db_settings:
            return False

        db.delete(db_settings)
        db.commit()
        return True
