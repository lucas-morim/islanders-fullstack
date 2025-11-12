from typing import Sequence, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.answer import Answer


class AnswerRepository:
    async def list(self, db: AsyncSession, *, skip: int = 0, limit: int = 100) -> Sequence[Answer]:
        result = await db.execute(select(Answer).offset(skip).limit(limit))
        return result.scalars().all()

    async def get(self, db: AsyncSession, answer_id: str) -> Optional[Answer]:
        return await db.get(Answer, answer_id)

    async def create(
        self,
        db: AsyncSession,
        *,
        attempt_id: str,
        question_id: str,
        option_id: Optional[str] = None
    ) -> Answer:
        obj = Answer(
            attempt_id=attempt_id,
            question_id=question_id,
            option_id=option_id,
        )
        db.add(obj)
        await db.commit()
        await db.refresh(obj)
        return obj

    async def update(
        self,
        db: AsyncSession,
        answer: Answer,
        *,
        option_id: Optional[str] = None
    ) -> Answer:
        if option_id is not None:
            answer.option_id = option_id

        db.add(answer)
        await db.commit()
        await db.refresh(answer)
        return answer

    async def delete(self, db: AsyncSession, answer: Answer) -> bool:
        if not answer:
            return None
        await db.delete(answer)
        await db.commit()
        return True
