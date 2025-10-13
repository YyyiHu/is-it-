"""API endpoints for epigram operations."""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session

from app.db import get_session
from app.schemas.epigram import EpigramCreate, EpigramRead, EpigramPaginatedResponse
from app.deps import get_current_active_user
from app.services.epigram import EpigramService
from app.models.user import User

router = APIRouter(prefix="/epigrams", tags=["Epigrams"])


def get_epigram_service(session: Session = Depends(get_session)) -> EpigramService:
    """Dependency to get epigram service instance."""
    return EpigramService(session)


@router.get("/random/batch", response_model=List[EpigramRead])
def get_random_epigrams_batch(
    count: int = Query(
        default=5, ge=1, le=20, description="Number of epigrams to fetch"
    ),
    current_id: Optional[int] = Query(
        None, description="Currently displayed epigram ID to avoid repeating"
    ),
    service: EpigramService = Depends(get_epigram_service),
):
    """Get multiple random epigrams for client caching."""
    epigrams = service.get_random_approved(count=count, exclude_id=current_id)
    if not epigrams:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="No epigrams available"
        )
    return epigrams


@router.post("/", response_model=EpigramRead, status_code=status.HTTP_201_CREATED)
def create_epigram(
    payload: EpigramCreate,
    service: EpigramService = Depends(get_epigram_service),
    current_user: User = Depends(get_current_active_user),
):
    """Create new epigram (authenticated users only)."""
    try:
        epigram = service.create_epigram(payload, current_user.id)
        return epigram
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e)) from e


@router.get("/mine", response_model=EpigramPaginatedResponse)
def list_my_epigrams(
    page: int = Query(1, ge=1, description="Page number (1-based)"),
    limit: int = Query(10, ge=1, le=100, description="Items per page (max 100)"),
    service: EpigramService = Depends(get_epigram_service),
    current_user: User = Depends(get_current_active_user),
):
    """Get epigrams created by current authenticated user with pagination."""
    epigrams, total = service.get_user_epigrams(current_user.id, page=page, limit=limit)

    # Calculate pagination metadata
    pages = (total + limit - 1) // limit  # Ceiling division
    has_next = page < pages
    has_prev = page > 1

    return EpigramPaginatedResponse(
        items=epigrams,
        total=total,
        page=page,
        size=limit,
        pages=pages,
        has_next=has_next,
        has_prev=has_prev,
    )


# Removed unused get single epigram endpoint


@router.put("/{epigram_id}", response_model=EpigramRead)
def update_epigram(
    epigram_id: int,
    payload: EpigramCreate,
    service: EpigramService = Depends(get_epigram_service),
    current_user: User = Depends(get_current_active_user),
):
    """Update an existing epigram (owner only)."""
    try:
        epigram = service.update_epigram(epigram_id, payload, current_user.id)
        return epigram
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e)) from e
    except PermissionError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e)) from e


@router.delete("/{epigram_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_epigram(
    epigram_id: int,
    service: EpigramService = Depends(get_epigram_service),
    current_user: User = Depends(get_current_active_user),
):
    """Delete an epigram (owner only)."""
    try:
        service.delete_epigram(epigram_id, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e)) from e
    except PermissionError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e)) from e
