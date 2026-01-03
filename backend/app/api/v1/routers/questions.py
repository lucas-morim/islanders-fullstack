from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from app.core.deps import get_db
from app.schemas.question import QuestionCreate, QuestionUpdate, QuestionOut
from app.services.question_service import service as question_service

router = APIRouter()


@router.get("/", response_model=List[QuestionOut])
async def list_questions(
    db: AsyncSession = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: Optional[int] = Query(None, ge=1)
):
    return await question_service.list(db, skip=skip, limit=limit)


@router.get("/{question_id}", response_model=QuestionOut)
async def get_question(
    question_id: str,
    db: AsyncSession = Depends(get_db)
):
    return await question_service.get(db, question_id)


@router.post("/", response_model=QuestionOut, status_code=status.HTTP_201_CREATED)
async def create_question(
    payload: QuestionCreate,
    db: AsyncSession = Depends(get_db)
):
    return await question_service.create(
        db,
        text=payload.text,
        quiz_id=payload.quiz_id,
        option_ids=payload.option_ids
    )


@router.put("/{question_id}", response_model=QuestionOut)
async def update_question(
    question_id: str,
    payload: QuestionUpdate,
    db: AsyncSession = Depends(get_db)
):
    return await question_service.update(
        db,
        question_id,
        text=payload.text,
        quiz_id=payload.quiz_id,
        option_ids=payload.option_ids
    )


@router.delete("/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_question(
    question_id: str,
    db: AsyncSession = Depends(get_db)
):
    await question_service.delete(db, question_id)
    return None