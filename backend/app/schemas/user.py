from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, validator
import re


# User Registration
class UserCreate(BaseModel):
    username: str = Field(
        min_length=3,
        max_length=50,
        description="Username (3-50 characters, alphanumeric, underscore, hyphen only)",
    )
    password: str = Field(
        min_length=8,
        max_length=50,
        description="Password (8-50 characters, must contain uppercase, lowercase, number, and special character)",
    )

    @validator("username")
    def validate_username(cls, v):
        if not re.match(r"^[a-zA-Z0-9_-]+$", v):
            raise ValueError(
                "Username can only contain letters, numbers, underscores, and hyphens"
            )
        return v

    @validator("password")
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one number")
        if not re.search(r'[!@#$%^&*()_+\-=\[\]{};\':"\\|,.<>\/?]', v):
            raise ValueError(
                "Password must contain at least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)"
            )
        return v


# User Login
class UserLogin(BaseModel):
    username: str = Field(description="Username")
    password: str = Field(description="Password")


# User Response (without password)
class UserRead(BaseModel):
    id: int
    username: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# User Settings
class UserSettingsCreate(BaseModel):
    auto_reload_enabled: bool = Field(
        default=False, description="Enable auto-reload timer"
    )
    auto_reload_interval_minutes: int = Field(
        default=5, ge=1, le=240, description="Auto-reload interval in minutes"
    )


class UserSettingsUpdate(BaseModel):
    auto_reload_enabled: Optional[bool] = Field(
        default=None, description="Enable auto-reload timer"
    )
    auto_reload_interval_minutes: Optional[int] = Field(
        default=None, ge=1, le=240, description="Auto-reload interval in minutes"
    )


class UserSettingsRead(BaseModel):
    id: int
    user_id: int
    auto_reload_enabled: bool
    auto_reload_interval_minutes: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# JWT Token
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    username: Optional[str] = None
