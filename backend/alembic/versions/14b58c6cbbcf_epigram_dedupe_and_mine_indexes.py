"""epigram dedupe and mine indexes

Revision ID: 14b58c6cbbcf
Revises: dd4c7c1207f7
Create Date: 2025-10-10 08:16:38.392884

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "14b58c6cbbcf"
down_revision: Union[str, Sequence[str], None] = "dd4c7c1207f7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    """Case insensitive dedupe on text and author, speed up GET /api/epigrams/mine"""
    op.execute(
        """
    CREATE UNIQUE INDEX IF NOT EXISTS uq_epigrams_text_author_ci
    ON epigrams (lower(text), coalesce(lower(author), ''));
    """
    )

    op.execute(
        """
    CREATE INDEX IF NOT EXISTS idx_epigrams_client_created_desc
    ON epigrams (client_id, created_at DESC)
    INCLUDE (id, text, author);
    """
    )


def downgrade():
    op.execute("DROP INDEX IF EXISTS idx_epigrams_client_created_desc;")
    op.execute("DROP INDEX IF EXISTS uq_epigrams_text_author_ci;")
