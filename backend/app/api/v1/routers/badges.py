from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from app.core.deps import get_db
from app.schemas.badge import BadgeCreate, BadgeUpdate, BadgeOut
from app.services.badge_service import service as badge_service

router = APIRouter()

@router.get("/", response_model=List[BadgeOut])
async def list_badges(
    db: AsyncSession = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: Optional[int] = Query(None, ge=1),
):
    return await badge_service.list(db, skip=skip, limit=limit)

@router.get("/{badge_id}", response_model=BadgeOut)
async def get_badge(
    badge_id: str,
    db: AsyncSession = Depends(get_db),
):
    return await badge_service.get(db, badge_id)

@router.post("/", response_model=BadgeOut, status_code=status.HTTP_201_CREATED)
async def create_badge(
    payload: BadgeCreate,
    db: AsyncSession = Depends(get_db),
):
    return await badge_service.create(
        db,
        code=payload.code.value,
        name=payload.name,
        min_score=payload.min_score,
        image=payload.image,
    )

@router.put("/{badge_id}", response_model=BadgeOut)
async def update_badge(
    badge_id: str,
    payload: BadgeUpdate,
    db: AsyncSession = Depends(get_db),
):
    return await badge_service.update(
        db,
        badge_id,
        name=payload.name,
        min_score=payload.min_score,
        image=payload.image,
    )

@router.delete("/{badge_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_badge(
    badge_id: str,
    db: AsyncSession = Depends(get_db),
):
    await badge_service.delete(db, badge_id)
    return None
