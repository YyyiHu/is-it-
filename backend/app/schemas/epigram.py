"""Epigram API schemas."""

from datetime import datetime
from typing import Optional, List, Generic, TypeVar
from pydantic import BaseModel, Field, ConfigDict

T = TypeVar("T")


class EpigramBase(BaseModel):
    """Base epigram fields."""

    text: str = Field(
        ..., min_length=1, max_length=150, description="Epigram content text"
    )
    author: Optional[str] = Field(
        None, max_length=50, description="Optional author name"
    )


class EpigramCreate(EpigramBase):
    """Create epigram request."""


class EpigramRead(BaseModel):
    """Read epigram response."""

    model_config = ConfigDict(from_attributes=True)

    id: int = Field(..., description="Unique identifier of the Epigram")
    text: str = Field(..., description="Epigram content text")
    author: Optional[str] = Field(None, description="Optional author name")
    user_id: int = Field(..., description="User who submitted this epigram")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")


class PaginatedResponse(BaseModel, Generic[T]):
    """Generic paginated response."""

    items: List[T] = Field(..., description="List of items for this page")
    total: int = Field(..., description="Total number of items")
    page: int = Field(..., description="Current page number")
    size: int = Field(..., description="Number of items per page")
    pages: int = Field(..., description="Total number of pages")
    has_next: bool = Field(..., description="Whether there are more pages")
    has_prev: bool = Field(..., description="Whether there are previous pages")


class EpigramPaginatedResponse(PaginatedResponse[EpigramRead]):
    """Paginated epigram response."""

    # This class inherits all functionality from PaginatedResponse
