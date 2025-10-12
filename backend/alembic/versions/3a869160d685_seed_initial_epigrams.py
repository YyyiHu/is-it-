"""seed_initial_epigrams

Revision ID: 3a869160d685
Revises: 14b58c6cbbcf
Create Date: 2025-10-10 12:26:47.153089

"""

from typing import Sequence, Union
import json
from pathlib import Path

from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import text

# revision identifiers, used by Alembic.
revision: str = "3a869160d685"
down_revision: Union[str, Sequence[str], None] = "14b58c6cbbcf"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Seed initial epigrams from JSON file with idempotent insert."""
    # Create users table if it doesn't exist
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("username", sa.String(length=50), nullable=False),
        sa.Column("hashed_password", sa.String(length=255), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_users_username"), "users", ["username"], unique=True)

    # Create user_settings table
    op.create_table(
        "user_settings",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column(
            "auto_reload_enabled", sa.Boolean(), nullable=False, server_default="false"
        ),
        sa.Column(
            "auto_reload_interval_minutes",
            sa.Integer(),
            nullable=False,
            server_default="5",
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.CheckConstraint(
            "auto_reload_interval_minutes >= 1 AND auto_reload_interval_minutes <= 240",
            name="ck_user_settings_interval_range",
        ),
    )
    op.create_index(
        op.f("ix_user_settings_user_id"), "user_settings", ["user_id"], unique=True
    )

    # Add user_id column to epigrams table
    op.add_column("epigrams", sa.Column("user_id", sa.Integer(), nullable=True))
    op.create_index(op.f("ix_epigrams_user_id"), "epigrams", ["user_id"])
    op.create_foreign_key(
        "fk_epigrams_user_id", "epigrams", "users", ["user_id"], ["id"]
    )

    # Remove client_id column from epigrams table
    op.drop_index(op.f("ix_epigrams_client_id"), table_name="epigrams")
    op.drop_column("epigrams", "client_id")

    # Create system user for seeded epigrams
    # Using Argon2 hash for password "system" (not meant to be used for login)
    system_user_insert = text(
        """
        INSERT INTO users (username, hashed_password, is_active, created_at)
        VALUES ('system', '$argon2id$v=19$m=65536,t=3,p=4$VnRrOUVLRlJZWXdJSWZBcA$TYh8qj9WTkzZkNLlxvwUw/YwEMuCpeCGbSixhkHvMCM', false, NOW())
        RETURNING id
    """
    )

    # Execute the insert and get the system user ID
    connection = op.get_bind()
    result = connection.execute(system_user_insert)
    system_user_id = result.fetchone()[0]

    # Try multiple paths to find the JSON file (works in both dev and Docker)
    possible_paths = [
        Path(__file__).parent.parent.parent
        / "app"
        / "seeds"
        / "epigrams.json",  # Dev path
        Path("/app/app/seeds/epigrams.json"),  # Docker path
        Path("app/seeds/epigrams.json"),  # Relative path
    ]

    epigrams_data = None
    for json_path in possible_paths:
        try:
            with open(json_path, "r", encoding="utf-8") as f:
                epigrams_data = json.load(f)
                print(f"Successfully loaded epigrams from {json_path}")
                break
        except (FileNotFoundError, json.JSONDecodeError):
            continue

    if not epigrams_data:
        print("Warning: Could not find or load epigrams.json, using fallback data")
        # Fallback data if JSON file is not found
        epigrams_data = [
            ["Simplicity is the ultimate sophistication.", "Leonardo da Vinci"],
            [
                "Programs must be written for people to read, and only incidentally for machines to execute.",
                "Harold Abelson",
            ],
            ["Premature optimization is the root of all evil.", "Donald Knuth"],
            ["Perfect is the enemy of good.", "Voltaire"],
            ["Talk is cheap. Show me the code.", "Linus Torvalds"],
        ]

    # Seed epigrams with the system user ID
    for item in epigrams_data:
        if isinstance(item, list) and len(item) >= 1:
            epigram_text = item[0]
            epigram_author = item[1] if len(item) > 1 and item[1] is not None else None

            # Use parameterized query to avoid SQL injection and escaping issues
            connection.execute(
                sa.text(
                    """
                    INSERT INTO epigrams (text, author, status, user_id)
                    VALUES (:text, :author, 1, :user_id)
                    ON CONFLICT (lower(text), coalesce(lower(author), '')) DO NOTHING
                """
                ),
                {
                    "text": epigram_text,
                    "author": epigram_author,
                    "user_id": system_user_id,
                },
            )

    # Update any existing epigrams to use the system user
    connection.execute(
        sa.text(
            """
            UPDATE epigrams
            SET user_id = :system_user_id
            WHERE user_id IS NULL
            """
        ),
        {"system_user_id": system_user_id},
    )

    # Make user_id non-nullable now that all epigrams have a user
    op.alter_column("epigrams", "user_id", nullable=False)


def downgrade() -> None:
    """
    Downgrade.
    """
    # Add back client_id column
    op.add_column(
        "epigrams", sa.Column("client_id", sa.String(length=50), nullable=True)
    )
    op.create_index(op.f("ix_epigrams_client_id"), "epigrams", ["client_id"])

    # Make user_id nullable first
    op.alter_column("epigrams", "user_id", nullable=True)

    # Drop foreign key constraint
    op.drop_constraint("fk_epigrams_user_id", "epigrams", type_="foreignkey")
    op.drop_index(op.f("ix_epigrams_user_id"), table_name="epigrams")
    op.drop_column("epigrams", "user_id")

    # Drop user_settings table
    op.drop_index(op.f("ix_user_settings_user_id"), table_name="user_settings")
    op.drop_table("user_settings")

    # Drop users table
    op.drop_index(op.f("ix_users_username"), table_name="users")
    op.drop_table("users")

    print("Downgrade: Keeping seeded epigrams")
