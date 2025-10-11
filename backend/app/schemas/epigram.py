"""Epigram API schemas."""

from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class EpigramBase(BaseModel):
    """Base epigram fields."""

    text: str = Field(
        ..., min_length=1, max_length=150, description="Epigram content text"
    )
    author: Optional[str] = Field(
        None, max_length=50, description="Optional author name"
    )
    client_id: Optional[str] = Field(
        None, max_length=100, description="Anonymous browser identifier"
    )


class EpigramCreate(EpigramBase):
    """Create epigram request."""


class EpigramRead(BaseModel):
    """Read epigram response."""

    model_config = ConfigDict(from_attributes=True)

    id: int = Field(..., description="Unique identifier of the Epigram")
    text: str = Field(..., description="Epigram content text")
    author: Optional[str] = Field(None, description="Optional author name")
