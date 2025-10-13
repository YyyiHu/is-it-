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

    def create_epigram(self, payload: EpigramCreate, user_id: int) -> Epigram:
        """Create a new epigram.

        Args:
            payload: Creation data
            user_id: User ID of authenticated user

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
            user_id=user_id,
            status=EpigramStatus.APPROVED,
        )

        self.session.add(epigram)
        self.session.commit()
        self.session.refresh(epigram)
        return epigram

    def get_user_epigrams(
        self, user_id: int, page: int = 1, limit: int = 10
    ) -> tuple[List[Epigram], int]:
        """Get epigrams by user ID with pagination.

        Args:
            user_id: User ID
            page: Page number (1-based)
            limit: Number of items per page

        Returns:
            Tuple of (epigrams list, total count)
        """
        # Get total count
        count_stmt = select(func.count()).where(Epigram.user_id == user_id)
        total = self.session.exec(count_stmt).one()

        # Get paginated results
        offset = (page - 1) * limit
        stmt = (
            select(Epigram)
            .where(Epigram.user_id == user_id)
            .order_by(Epigram.updated_at.desc())
            .offset(offset)
            .limit(limit)
        )
        epigrams = list(self.session.exec(stmt).all())

        return epigrams, total

    # Removed unused get_epigram_by_id method

    def get_approved_count(self) -> int:
        """Get count of approved epigrams."""
        stmt = select(func.count()).where(Epigram.status == EpigramStatus.APPROVED)
        return self.session.exec(stmt).one()

    def update_epigram(
        self, epigram_id: int, payload: EpigramCreate, user_id: int
    ) -> Epigram:
        """Update an existing epigram.

        Args:
            epigram_id: ID of epigram to update
            payload: Update data
            user_id: User ID of authenticated user

        Returns:
            Updated epigram

        Raises:
            ValueError: If epigram not found
            PermissionError: If user doesn't own the epigram
        """
        epigram = self.session.get(Epigram, epigram_id)
        if not epigram:
            raise ValueError("Epigram not found")

        if epigram.user_id != user_id:
            raise PermissionError("You can only update your own epigrams")

        # Check for duplicates (excluding current epigram)
        existing = self.find_duplicate_excluding(
            payload.text, payload.author, epigram_id
        )
        if existing:
            raise ValueError("Epigram already exists")

        epigram.text = payload.text
        epigram.author = payload.author

        self.session.add(epigram)
        self.session.commit()
        self.session.refresh(epigram)
        return epigram

    def delete_epigram(self, epigram_id: int, user_id: int) -> None:
        """Delete an epigram.

        Args:
            epigram_id: ID of epigram to delete
            user_id: User ID of authenticated user

        Raises:
            ValueError: If epigram not found
            PermissionError: If user doesn't own the epigram
        """
        epigram = self.session.get(Epigram, epigram_id)
        if not epigram:
            raise ValueError("Epigram not found")

        if epigram.user_id != user_id:
            raise PermissionError("You can only delete your own epigrams")

        self.session.delete(epigram)
        self.session.commit()

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

    def find_duplicate_excluding(
        self, epigram_text: str, author: Optional[str], exclude_id: int
    ) -> Optional[Epigram]:
        """Find case-insensitive duplicate excluding a specific ID.

        Args:
            epigram_text: Text to check
            author: Optional author
            exclude_id: ID to exclude from search

        Returns:
            Matching epigram or None
        """
        # Handle None values safely
        author_lower = author.lower() if author else ""

        stmt = select(Epigram).where(
            func.lower(Epigram.text) == epigram_text.lower(),
            func.coalesce(func.lower(Epigram.author), "") == author_lower,
            Epigram.id != exclude_id,
        )
        return self.session.exec(stmt).first()
