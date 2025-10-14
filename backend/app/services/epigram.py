"""Service layer for epigram operations."""

from typing import List, Optional, Tuple
from sqlalchemy import func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.models.epigram import Epigram, EpigramStatus
from app.schemas.epigram import EpigramCreate


class EpigramService:
    """Handles epigram database operations."""

    def __init__(self, session: AsyncSession):
        self.session = session
        
    async def get_random_approved(
        self, count: int = 1, exclude_id: Optional[int] = None
    ) -> List[Epigram]:
        """Get random approved epigrams.

        Args:
            count: Number of epigrams to return
            exclude_id: ID to exclude from results

        Returns:
            List of random approved epigrams
        """
        stmt = select(Epigram).where(Epigram.status == EpigramStatus.APPROVED)
        if exclude_id is not None:
            stmt = stmt.where(Epigram.id != exclude_id)
            
        stmt = stmt.order_by(func.random()).limit(count)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())
        
    async def get_user_epigrams(
        self, user_id: int, page: int = 1, limit: int = 10
    ) -> Tuple[List[Epigram], int]:
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
        result = await self.session.execute(count_stmt)
        total = result.scalar_one()

        # Get paginated results
        offset = (page - 1) * limit
        stmt = (
            select(Epigram)
            .where(Epigram.user_id == user_id)
            .order_by(Epigram.updated_at.desc())
            .offset(offset)
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        epigrams = list(result.scalars().all())

        return epigrams, total
        
    async def create_epigram(self, payload: EpigramCreate, user_id: int) -> Epigram:
        """Create a new epigram.

        Args:
            payload: Creation data
            user_id: User ID of authenticated user

        Returns:
            Created epigram

        Raises:
            ValueError: If duplicate exists
        """
        existing = await self.find_duplicate(payload.text, payload.author)
        if existing:
            raise ValueError("Epigram already exists")

        epigram = Epigram(
            text=payload.text,
            author=payload.author,
            user_id=user_id,
            status=EpigramStatus.APPROVED,
        )

        self.session.add(epigram)
        await self.session.commit()
        await self.session.refresh(epigram)
        return epigram
        
    async def update_epigram(
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
        epigram = await self.session.get(Epigram, epigram_id)
        if not epigram:
            raise ValueError("Epigram not found")

        if epigram.user_id != user_id:
            raise PermissionError("You can only update your own epigrams")

        # Check for duplicates (excluding current epigram)
        existing = await self.find_duplicate_excluding(
            payload.text, payload.author, epigram_id
        )
        if existing:
            raise ValueError("Epigram already exists")

        epigram.text = payload.text
        epigram.author = payload.author

        self.session.add(epigram)
        await self.session.commit()
        await self.session.refresh(epigram)
        return epigram
        
    async def delete_epigram(self, epigram_id: int, user_id: int) -> None:
        """Delete an epigram.

        Args:
            epigram_id: ID of epigram to delete
            user_id: User ID of authenticated user

        Raises:
            ValueError: If epigram not found
            PermissionError: If user doesn't own the epigram
        """
        epigram = await self.session.get(Epigram, epigram_id)
        if not epigram:
            raise ValueError("Epigram not found")

        if epigram.user_id != user_id:
            raise PermissionError("You can only delete your own epigrams")

        await self.session.delete(epigram)
        await self.session.commit()
        
    async def find_duplicate(
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
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def find_duplicate_excluding(
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
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

