"""
Database engine and session helpers
"""

import os
from contextlib import contextmanager
from typing import Iterator

from dotenv import load_dotenv
from sqlmodel import create_engine, Session

# Load environment variables from .env
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL is not set. Create a .env file with DATABASE_URL=<url>"
    )

# Create a single engine for the process
engine = create_engine(
    DATABASE_URL,
    echo=True,  # prints SQL in the console during development
    pool_pre_ping=True,  # keeps connections healthy
)


@contextmanager
def session_scope() -> Iterator[Session]:
    """Context manager for scripts or background tasks."""
    session = Session(engine)
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def get_session() -> Iterator[Session]:
    """FastAPI dependency. Use Depends(get_session) in routes."""
    with Session(engine) as session:
        yield session
