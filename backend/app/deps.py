"""
Authentication dependencies for FastAPI routes.

This module provides dependency injection for JWT token validation
and user authentication in protected API endpoints using HTTP-only cookies.
"""

from typing import Optional

from fastapi import Depends, HTTPException, status, Request
from sqlmodel import Session

from app.db import get_session
from app.models.user import User
from app.services.auth import verify_token
from app.services.user import UserService


def get_current_user(
    request: Request,
    db: Session = Depends(get_session),
) -> User:
    """
    Dependency to get the current authenticated user from HTTP-only cookie.

    Args:
        request: FastAPI request object to access cookies
        db: Database session

    Returns:
        User: The authenticated user object

    Raises:
        HTTPException: If token is invalid or user not found
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # Get token from HTTP-only cookie
    token = request.cookies.get("access_token")
    if not token:
        raise credentials_exception

    # Verify the JWT token
    username = verify_token(token)
    if username is None:
        raise credentials_exception

    # Get user from database
    user = UserService.get_user_by_username(db, username)
    if user is None:
        raise credentials_exception

    # Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Inactive user"
        )

    return user


def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """
    Dependency to get the current active user.

    Args:
        current_user: User from get_current_user dependency

    Returns:
        User: The active user object

    Raises:
        HTTPException: If user is inactive
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user"
        )
    return current_user


def get_optional_current_user(
    request: Request,
    db: Session = Depends(get_session),
) -> Optional[User]:
    """
    Dependency to optionally get the current user from HTTP-only cookie.

    Args:
        request: FastAPI request object to access cookies
        db: Database session

    Returns:
        Optional[User]: The authenticated user object or None if not authenticated
    """
    # Get token from HTTP-only cookie
    token = request.cookies.get("access_token")
    if not token:
        return None

    # Verify the JWT token
    username = verify_token(token)
    if username is None:
        return None

    # Get user from database
    user = UserService.get_user_by_username(db, username)
    if user is None or not user.is_active:
        return None

    return user
