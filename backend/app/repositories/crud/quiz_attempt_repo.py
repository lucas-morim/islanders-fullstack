from typing import Sequence, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.quiz_attempt import QuizAttempt


class QuizAttemptRepository:
    async def list(self, db: AsyncSession, skip: int = 0, limit: int = 100) -> Sequence[QuizAttempt]:
        result = await db.execute(
            select(QuizAttempt).offset(skip).limit(limit).order_by(QuizAttempt.id)
        )
        return result.scalars().all()

    async def get(self, db: AsyncSession, attempt_id: str) -> Optional[QuizAttempt]:
        return await db.get(QuizAttempt, attempt_id)

    async def create(self, db: AsyncSession, *, score: float, finished_at, user_id: str, quiz_id: str) -> QuizAttempt:
        obj = QuizAttempt(score=score, finished_at=finished_at, user_id=user_id, quiz_id=quiz_id)
        db.add(obj)
        await db.commit()
        await db.refresh(obj)
        return obj

    async def update(self, db: AsyncSession, attempt: QuizAttempt, *, score=None, finished_at=None) -> QuizAttempt:
        if score is not None:
            attempt.score = score
        if finished_at is not None:
            attempt.finished_at = finished_at
        db.add(attempt)
        await db.commit()
        await db.refresh(attempt)
        return attempt

    async def delete(self, db: AsyncSession, attempt: QuizAttempt) -> None:
        await db.delete(attempt)
        await db.commit()

    async def list_by_user(self, db: AsyncSession, user_id: str):
        stmt = (
            select(QuizAttempt)
            .where(QuizAttempt.user_id == user_id)
            .order_by(QuizAttempt.finished_at.desc().nulls_last())
        )
        res = await db.execute(stmt)
        return res.scalars().all()
