from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.core.deps import get_db
from app.schemas.quiz_attempt import QuizAttemptCreate, QuizAttemptUpdate, QuizAttemptOut
from app.services.quiz_attempt_service import service as quiz_attempt_service

router = APIRouter()


@router.get("/", response_model=List[QuizAttemptOut])
async def list_quiz_attempts(
    db: AsyncSession = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100)
):
    return await quiz_attempt_service.list(db, skip=skip, limit=limit)


@router.get("/{attempt_id}", response_model=QuizAttemptOut)
async def get_quiz_attempt(
    attempt_id: str,
    db: AsyncSession = Depends(get_db)
):
    return await quiz_attempt_service.get(db, attempt_id)


@router.post("/", response_model=QuizAttemptOut, status_code=status.HTTP_201_CREATED)
async def create_quiz_attempt(
    payload: QuizAttemptCreate,
    db: AsyncSession = Depends(get_db)
):
    return await quiz_attempt_service.create(
        db,
        score=payload.score,
        finished_at=payload.finished_at,
        user_id=payload.user_id,
        quiz_id=payload.quiz_id,
    )


@router.put("/{attempt_id}", response_model=QuizAttemptOut)
async def update_quiz_attempt(
    attempt_id: str,
    payload: QuizAttemptUpdate,
    db: AsyncSession = Depends(get_db)
):
    return await quiz_attempt_service.update(
        db,
        attempt_id,
        score=payload.score,
        finished_at=payload.finished_at,
    )


@router.delete("/{attempt_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_quiz_attempt(
    attempt_id: str,
    db: AsyncSession = Depends(get_db)
):
    await quiz_attempt_service.delete(db, attempt_id)
    return None

@router.post("/{attempt_id}/finish", response_model=QuizAttemptOut)
async def finish_quiz_attempt(
    attempt_id: str,
    db: AsyncSession = Depends(get_db),
):
    return await quiz_attempt_service.finish(db, attempt_id)