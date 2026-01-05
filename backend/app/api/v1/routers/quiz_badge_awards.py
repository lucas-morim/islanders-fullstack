from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from app.core.deps import get_db
from app.schemas.quiz_badge_award import QuizBadgeAwardCreate, QuizBadgeAwardOut
from app.services.quiz_badge_award_service import service as award_service

router = APIRouter()

@router.get("/", response_model=List[QuizBadgeAwardOut])
async def list_awards(
    db: AsyncSession = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: Optional[int] = Query(None, ge=1),
):
    return await award_service.list(db, skip=skip, limit=limit)

@router.get("/by_user/{user_id}", response_model=List[QuizBadgeAwardOut])
async def list_by_user(
    user_id: str,
    db: AsyncSession = Depends(get_db),
):
    return await award_service.list_by_user(db, user_id)

@router.get("/{award_id}", response_model=QuizBadgeAwardOut)
async def get_award(
    award_id: str,
    db: AsyncSession = Depends(get_db),
):
    return await award_service.get(db, award_id)

@router.post("/", response_model=QuizBadgeAwardOut, status_code=status.HTTP_201_CREATED)
async def upsert_best_award(
    payload: QuizBadgeAwardCreate,
    db: AsyncSession = Depends(get_db),
):
    return await award_service.upsert_best(
        db,
        user_id=payload.user_id,
        quiz_id=payload.quiz_id,
        badge_id=payload.badge_id,
        attempt_id=payload.attempt_id,
    )

@router.delete("/{award_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_award(
    award_id: str,
    db: AsyncSession = Depends(get_db),
):
    await award_service.delete(db, award_id)
    return None
