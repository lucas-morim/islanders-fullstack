from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.core.deps import get_db
from app.schemas.question_option import QuestionOptionOut, QuestionOptionsSync
from app.services.question_option_service import service

router = APIRouter()  


@router.get("/", response_model=List[QuestionOptionOut])
async def list_question_options(
    question_id: str,
    db: AsyncSession = Depends(get_db),
):
    return await service.list_by_question(db, question_id)


@router.put("/sync", status_code=status.HTTP_204_NO_CONTENT)
async def sync_question_options(
    question_id: str,
    payload: QuestionOptionsSync,
    db: AsyncSession = Depends(get_db),
):
    await service.sync_question_options(
        db,
        question_id=question_id,
        option_ids=payload.option_ids,
        correct_option_id=payload.correct_option_id,
    )
    return None
