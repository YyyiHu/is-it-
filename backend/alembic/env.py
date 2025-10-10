import os
import sys
from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool

# Add backend directory to sys.path so Alembic can find the app package
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

# Optional: load .env for local development (ignored in Docker)
try:
    from dotenv import load_dotenv  # type: ignore

    load_dotenv()
except Exception:
    pass

from sqlmodel import SQLModel
from app.models.epigram import Epigram

# Alembic configuration
config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = SQLModel.metadata

# Read database URL
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is not set")


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    context.configure(
        url=DATABASE_URL,
        target_metadata=target_metadata,
        literal_binds=True,
        compare_type=True,
        compare_server_default=True,
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    cfg = config.get_section(config.config_ini_section) or {}
    cfg["sqlalchemy.url"] = DATABASE_URL

    connectable = engine_from_config(cfg, prefix="sqlalchemy.", poolclass=pool.NullPool)

    # Skip generating empty migration files
    def process_revision_directives(ctx, rev, directives):
        if (
            directives
            and getattr(directives[0], "upgrade_ops", None)
            and directives[0].upgrade_ops.is_empty()
        ):
            directives[:] = []

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
            compare_server_default=True,
            process_revision_directives=process_revision_directives,
        )
        with context.begin_transaction():
            context.run_migrations()


# Decide which mode to run
if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
