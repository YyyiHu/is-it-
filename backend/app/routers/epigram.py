"""API endpoints for epigram operations."""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session

from app.db import get_session
from app.schemas.epigram import EpigramCreate, EpigramRead
from app.deps import get_client_id
from app.services.epigram import EpigramService

router = APIRouter(prefix="/api/epigrams", tags=["Epigrams"])


def get_epigram_service(session: Session = Depends(get_session)) -> EpigramService:
    """Dependency to get epigram service instance."""
    return EpigramService(session)


@router.get("/random", response_model=EpigramRead)
def get_random_epigram(
    current_id: Optional[int] = Query(
        None, description="Currently displayed epigram ID to avoid repeating"
    ),
    service: EpigramService = Depends(get_epigram_service),
):
    """Get random epigram, avoiding current if possible."""
    epigrams = service.get_random_approved(count=1, exclude_id=current_id)
    if not epigrams:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="No epigrams available"
        )
    return epigrams[0]


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
    client_id: str = Depends(get_client_id),
):
    """Create new epigram."""
    try:
        epigram = service.create_epigram(payload, client_id)
        return epigram
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e)) from e


@router.get("/mine", response_model=List[EpigramRead])
def list_my_epigrams(
    service: EpigramService = Depends(get_epigram_service),
    client_id: str = Depends(get_client_id),
):
    """Get epigrams created by current client."""
    return service.get_client_epigrams(client_id)
