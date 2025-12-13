from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List

from app.core.deps import get_db
from app.models.question_option import QuestionOption

router = APIRouter()

@router.get("/counts")
async def count_questions_options_batch(
    question_ids: List[str] = Query(...),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(
            QuestionOption.question_id,
            func.count(QuestionOption.option_id).label("count")
        )
        .where(QuestionOption.question_id.in_(question_ids))
        .group_by(QuestionOption.question_id)
    )
    rows = result.all()
    return {qid: int(cnt) for qid, cnt in rows}

@router.get("/usage-counts")
async def options_usage_counts(
    option_ids: List[str] = Query(...),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(
            QuestionOption.option_id,
            func.count(QuestionOption.question_id).label("count")
        )
        .where(QuestionOption.option_id.in_(option_ids))
        .group_by(QuestionOption.option_id)
    )
    rows = result.all()
    return {oid: int(cnt) for oid, cnt in rows}