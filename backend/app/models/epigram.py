"""Epigram model with SQLAlchemy types."""

from __future__ import annotations

from datetime import datetime
from enum import IntEnum
from typing import Optional

from sqlalchemy import CheckConstraint, Column, DateTime, SmallInteger, String
from sqlalchemy.sql import func
from sqlmodel import Field, SQLModel


class EpigramStatus(IntEnum):
    """Moderation status values."""

    PENDING = 0
    APPROVED = 1
    REJECTED = 2


class Epigram(SQLModel, table=True):
    """Epigram database model."""

    __tablename__ = "epigrams"
    __table_args__ = (
        CheckConstraint("status in (0, 1, 2)", name="ck_epigrams_status_range"),
    )

    id: Optional[int] = Field(default=None, primary_key=True)

    text: str = Field(
        sa_type=String(500),
        nullable=False,
        index=True,
        description="Epigram content up to 500 characters",
    )

    author: Optional[str] = Field(
        default=None,
        sa_type=String(100),
        index=True,
        description="Optional author name up to 100 characters",
    )

    # Use explicit SmallInteger, default to 1
    status: int = Field(
        sa_column=Column(
            SmallInteger,
            nullable=False,
            server_default="1",
            comment="0 pending 1 approved 2 rejected",
        )
    )

    client_id: Optional[str] = Field(
        default=None,
        sa_type=String(100),
        index=True,
        description="Anonymous browser identifier",
    )

    created_at: datetime = Field(
        sa_column=Column(
            DateTime(timezone=True),
            nullable=False,
            server_default=func.now(),
            comment="Creation timestamp",
        )
    )

    updated_at: datetime = Field(
        sa_column=Column(
            DateTime(timezone=True),
            nullable=False,
            server_default=func.now(),
            onupdate=func.now(),
            comment="Last update timestamp",
        )
    )
