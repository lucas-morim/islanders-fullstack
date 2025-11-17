from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.core.deps import get_db
from app.schemas.quiz import QuizCreate, QuizOut, QuizUpdate
from app.services.quiz_service import service as quiz_service

router = APIRouter()


@router.get("/", response_model=List[QuizOut])
async def list_quizzes(
    db: AsyncSession = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100)
):
    return await quiz_service.list(db, skip=skip, limit=limit)


@router.get("/{quiz_id}", response_model=QuizOut)
async def get_quiz(
    quiz_id: str,
    db: AsyncSession = Depends(get_db)
):
    return await quiz_service.get(db, quiz_id)


@router.post("/", response_model=QuizOut, status_code=status.HTTP_201_CREATED)
async def create_quiz(
    payload: QuizCreate,
    db: AsyncSession = Depends(get_db)
):
    return await quiz_service.create(
        db,
        title=payload.title,
        description=payload.description,
        user_id=payload.user_id,
        course_id=payload.course_id
    )


@router.put("/{quiz_id}", response_model=QuizOut)
async def update_quiz(
    quiz_id: str,
    payload: QuizUpdate,
    db: AsyncSession = Depends(get_db)
):
    return await quiz_service.update(
        db,
        quiz_id,
        title=payload.title,
        description=payload.description,
        course_id=payload.course_id
    )


@router.delete("/{quiz_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_quiz(
    quiz_id: str,
    db: AsyncSession = Depends(get_db)
):
    await quiz_service.delete(db, quiz_id)
    return None