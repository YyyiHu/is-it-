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


# revision identifiers, used by Alembic.
revision: str = "3a869160d685"
down_revision: Union[str, Sequence[str], None] = "14b58c6cbbcf"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Seed initial epigrams from JSON file with idempotent insert."""
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

    # Use parameterized queries for better security and reliability
    connection = op.get_bind()

    for item in epigrams_data:
        if isinstance(item, list) and len(item) >= 1:
            text = item[0]
            author = item[1] if len(item) > 1 and item[1] is not None else None

            # Use parameterized query to avoid SQL injection and escaping issues
            connection.execute(
                sa.text(
                    """
                    INSERT INTO epigrams (text, author, status)
                    VALUES (:text, :author, 1)
                    ON CONFLICT (lower(text), coalesce(lower(author), '')) DO NOTHING
                """
                ),
                {"text": text, "author": author},
            )


def downgrade() -> None:
    """
    Downgrade.
    """

    print("Downgrade: Keeping seeded epigrams")
