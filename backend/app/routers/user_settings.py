"""
User settings API routes.

This module handles user-specific settings management for authenticated users.
"""

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from app.db import get_session
from app.deps import get_current_active_user
from app.models.user import User
from app.schemas.user import UserSettingsCreate, UserSettingsRead, UserSettingsUpdate
from app.services.user_settings import UserSettingsService

router = APIRouter(prefix="/users", tags=["user-settings"])


@router.get("/settings", response_model=UserSettingsRead)
def get_user_settings(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_session),
) -> Any:
    """
    Get current user's settings.

    Retrieves the authenticated user's auto-reload preferences
    and other personalized settings.

    Args:
        current_user: Current authenticated user from JWT token
        db: Database session

    Returns:
        UserSettingsRead: User's current settings

    Raises:
        HTTPException: If user settings not found
    """
    settings = UserSettingsService.get_user_settings(db, current_user.id)
    if not settings:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User settings not found"
        )
    return settings


@router.put("/settings", response_model=UserSettingsRead)
def update_user_settings(
    settings_update: UserSettingsUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_session),
) -> Any:
    """
    Update current user's settings.

    Updates the authenticated user's auto-reload preferences.
    Only provided fields will be updated.

    Args:
        settings_update: Settings data to update
        current_user: Current authenticated user from JWT token
        db: Database session

    Returns:
        UserSettingsRead: Updated user settings

    Raises:
        HTTPException: If user settings not found
    """
    settings = UserSettingsService.update_user_settings(
        db, current_user.id, settings_update
    )
    if not settings:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User settings not found"
        )
    return settings


@router.delete("/settings")
def delete_user_settings(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_session),
) -> Any:
    """
    Delete current user's settings (reset to defaults).

    Removes the authenticated user's custom settings.
    Default settings will be recreated on next access.

    Args:
        current_user: Current authenticated user from JWT token
        db: Database session

    Returns:
        dict: Success message

    Raises:
        HTTPException: If user settings not found
    """
    success = UserSettingsService.delete_user_settings(db, current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User settings not found"
        )

    # Create default settings
    UserSettingsService.create_default_settings(db, current_user.id)

    return {"message": "User settings reset to defaults"}
