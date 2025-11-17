from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.core.deps import get_db
from app.schemas.answer import AnswerCreate, AnswerUpdate, AnswerOut
from app.services.answer_service import service as answer_service

router = APIRouter()


@router.get("/", response_model=List[AnswerOut])
async def list_answers(
    db: AsyncSession = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100)
):
    return await answer_service.list(db, skip=skip, limit=limit)


@router.get("/{answer_id}", response_model=AnswerOut)
async def get_answer(
    answer_id: str,
    db: AsyncSession = Depends(get_db)
):
    return await answer_service.get(db, answer_id)


@router.post("/", response_model=AnswerOut, status_code=status.HTTP_201_CREATED)
async def create_answer(
    payload: AnswerCreate,
    db: AsyncSession = Depends(get_db)
):
    return await answer_service.create(
        db,
        attempt_id=payload.attempt_id,
        question_id=payload.question_id,
        option_id=payload.option_id,
    )


@router.put("/{answer_id}", response_model=AnswerOut)
async def update_answer(
    answer_id: str,
    payload: AnswerUpdate,
    db: AsyncSession = Depends(get_db)
):
    return await answer_service.update(
        db,
        answer_id,
        option_id=payload.option_id,
    )


@router.delete("/{answer_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_answer(
    answer_id: str,
    db: AsyncSession = Depends(get_db)
):
    await answer_service.delete(db, answer_id)
    return None