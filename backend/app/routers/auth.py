"""
Authentication API routes.

This module handles user registration, login, and authentication-related endpoints.
"""

from datetime import timedelta
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlmodel import Session

from app.db import get_session
from app.deps import get_current_active_user
from app.models.user import User
from app.schemas.user import Token, UserCreate, UserLogin, UserRead
from app.services.auth import ACCESS_TOKEN_EXPIRE_MINUTES, create_access_token
from app.services.user import UserService

router = APIRouter(prefix="/auth", tags=["authentication"])


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def register_user(
    user_create: UserCreate,
    response: Response,
    db: Session = Depends(get_session),
) -> Any:
    """
    Register a new user and automatically log them in.

    Creates a new user account with username and password.
    Also creates default user settings and sets JWT token in HTTP-only cookie.

    Args:
        user_create: User registration data (username, password)
        response: FastAPI response object for setting cookies
        db: Database session

    Returns:
        UserRead: The created user data (without password)

    Raises:
        HTTPException: If username already exists
    """
    # Check if username already exists
    existing_user = UserService.get_user_by_username(db, user_create.username)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered",
        )

    # Create the user
    user = UserService.create_user(db, user_create)

    # Create access token for auto-login
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )

    # Set HTTP-only cookie
    response.set_cookie(
        key="access_token",
        value=access_token,
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,  # Convert to seconds
        httponly=True,
        secure=False,  # Set to True in production with HTTPS
        samesite="lax",
    )

    return user


@router.post("/login", response_model=UserRead)
def login_user(
    user_login: UserLogin,
    response: Response,
    db: Session = Depends(get_session),
) -> Any:
    """
    Authenticate user and return user data with JWT token in HTTP-only cookie.

    Validates username and password, then sets a JWT access token
    in an HTTP-only cookie for authenticated API requests.

    Args:
        user_login: User login credentials (username, password)
        response: FastAPI response object for setting cookies
        db: Database session

    Returns:
        UserRead: User data (without password)

    Raises:
        HTTPException: If credentials are invalid
    """
    # Authenticate user
    user = UserService.authenticate_user(db, user_login.username, user_login.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )

    # Set HTTP-only cookie
    response.set_cookie(
        key="access_token",
        value=access_token,
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,  # Convert to seconds
        httponly=True,
        secure=False,  # Set to True in production with HTTPS
        samesite="lax",
    )

    return user


@router.get("/me", response_model=UserRead)
def get_current_user_info(
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Get current user information.

    Returns the authenticated user's profile information.
    Requires valid JWT token in Authorization header.

    Args:
        current_user: Current authenticated user from JWT token

    Returns:
        UserRead: Current user's profile data
    """
    return current_user


@router.post("/logout")
def logout_user(response: Response) -> Any:
    """
    Logout user by clearing the HTTP-only cookie.

    Removes the JWT token cookie from the client browser.

    Args:
        response: FastAPI response object for clearing cookies

    Returns:
        dict: Success message
    """
    response.delete_cookie(key="access_token", httponly=True, samesite="lax")
    return {"message": "Successfully logged out"}


@router.post("/verify-token")
def verify_user_token(
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Verify if the current JWT token is valid.

    Endpoint to check token validity without returning user data.
    Useful for frontend authentication state management.

    Args:
        current_user: Current authenticated user from JWT token

    Returns:
        dict: Token validity confirmation
    """
    return {
        "valid": True,
        "user_id": current_user.id,
        "username": current_user.username,
    }
