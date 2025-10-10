"""Service layer for epigram operations."""

from typing import List, Optional
from sqlalchemy import func
from sqlmodel import Session, select

from app.models.epigram import Epigram, EpigramStatus
from app.schemas.epigram import EpigramCreate


class EpigramService:
    """Handles epigram database operations."""

    def __init__(self, session: Session):
        self.session = session

    def get_random_approved(
        self, count: int = 1, exclude_id: Optional[int] = None
    ) -> List[Epigram]:
        """Get random approved epigrams.

        Args:
            count: Number of epigrams to return
            exclude_id: ID to exclude from results

        Returns:
            List of random approved epigrams
        """
        total_count = self.get_approved_count()
        if total_count == 0:
            return []

        if total_count == 1 and exclude_id is not None:
            exclude_id = None

        stmt = select(Epigram).where(Epigram.status == EpigramStatus.APPROVED)
        if exclude_id is not None:
            stmt = stmt.where(Epigram.id != exclude_id)

        stmt = stmt.order_by(func.random()).limit(count)
        result = list(self.session.exec(stmt).all())

        if len(result) < count and exclude_id is not None:
            excluded = self.session.get(Epigram, exclude_id)
            if excluded and excluded.status == EpigramStatus.APPROVED:
                result.append(excluded)

        return result

    def create_epigram(self, payload: EpigramCreate, client_id: str) -> Epigram:
        """Create a new epigram.

        Args:
            payload: Creation data
            client_id: Client ID

        Returns:
            Created epigram

        Raises:
            ValueError: If duplicate exists
        """
        existing = self.find_duplicate(payload.text, payload.author)
        if existing:
            raise ValueError("Epigram already exists")

        epigram = Epigram(
            text=payload.text,
            author=payload.author,
            client_id=client_id,
            status=EpigramStatus.APPROVED,
        )

        self.session.add(epigram)
        self.session.commit()
        self.session.refresh(epigram)
        return epigram

    def get_client_epigrams(self, client_id: str) -> List[Epigram]:
        """Get epigrams by client ID.

        Args:
            client_id: Client ID

        Returns:
            List of epigrams, newest first
        """
        stmt = (
            select(Epigram)
            .where(Epigram.client_id == client_id)
            .order_by(Epigram.id.desc())
        )
        return list(self.session.exec(stmt).all())

    def get_approved_count(self) -> int:
        """Get count of approved epigrams."""
        stmt = select(func.count(Epigram.id)).where(
            Epigram.status == EpigramStatus.APPROVED
        )
        return self.session.exec(stmt).one()

    def find_duplicate(
        self, epigram_text: str, author: Optional[str]
    ) -> Optional[Epigram]:
        """Find case-insensitive duplicate.

        Args:
            epigram_text: Text to check
            author: Optional author

        Returns:
            Matching epigram or None
        """
        # Handle None values safely
        author_lower = author.lower() if author else ""

        stmt = select(Epigram).where(
            func.lower(Epigram.text) == epigram_text.lower(),
            func.coalesce(func.lower(Epigram.author), "") == author_lower,
        )
        return self.session.exec(stmt).first()
