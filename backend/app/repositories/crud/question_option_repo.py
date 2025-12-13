from typing import Sequence
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete

from app.models.question_option import QuestionOption


class QuestionOptionRepository:

    async def list_by_question(
        self,
        db: AsyncSession,
        question_id: str
    ) -> Sequence[QuestionOption]:
        result = await db.execute(
            select(QuestionOption)
            .where(QuestionOption.question_id == question_id)
        )
        return result.scalars().all()

    async def delete_by_question(
        self,
        db: AsyncSession,
        question_id: str
    ) -> None:
        await db.execute(
            delete(QuestionOption)
            .where(QuestionOption.question_id == question_id)
        )
        await db.commit()

    async def bulk_create(
        self,
        db: AsyncSession,
        items: list[QuestionOption]
    ) -> None:
        db.add_all(items)
        await db.commit()
