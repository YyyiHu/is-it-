"""
Database engine and session helpers
"""

import os
from contextlib import asynccontextmanager
from typing import AsyncIterator

from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlmodel.ext.asyncio.session import AsyncSession as SQLModelAsyncSession

# Load environment variables from .env
load_dotenv()

# Get database URL
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL is not set. Create a .env file with DATABASE_URL=<url>"
    )

# Create async database URL (replace postgresql:// with postgresql+asyncpg://)
ASYNC_DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")

# Create async engine
async_engine = create_async_engine(
    ASYNC_DATABASE_URL,
    echo=True,  # prints SQL in the console during development
    pool_pre_ping=True,  # keeps connections healthy
)


@asynccontextmanager
async def async_session_scope() -> AsyncIterator[AsyncSession]:
    """Async context manager for scripts or background tasks."""
    async with AsyncSession(async_engine) as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


async def get_async_session() -> AsyncIterator[SQLModelAsyncSession]:
    """FastAPI dependency for async session."""
    async with SQLModelAsyncSession(async_engine) as session:
        yield session
