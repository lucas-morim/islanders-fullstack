from typing import Sequence, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from app.repositories.crud.quiz_attempt_repo import QuizAttemptRepository
from app.models.quiz_attempt import QuizAttempt
import datetime as dt


class QuizAttemptService:
    def __init__(self):
        self.repo = QuizAttemptRepository()

    async def list(self, db: AsyncSession, skip: int = 0, limit: int = 100) -> Sequence[QuizAttempt]:
        return await self.repo.list(db, skip=skip, limit=limit)

    async def get(self, db: AsyncSession, quiz_attempt_id: str) -> QuizAttempt:
        quiz_attempt = await self.repo.get(db, quiz_attempt_id)
        if not quiz_attempt:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Quiz attempt not found"
            )
        return quiz_attempt

    async def create(
        self,
        db: AsyncSession,
        *,
        score: float,
        user_id: str,
        quiz_id: str,
        finished_at: Optional[dt.datetime] = None
    ) -> QuizAttempt:
        # define a data e hora atual se o user não enviar nenhuma
        if finished_at is None:
            finished_at = dt.datetime.now(dt.timezone.utc)

        quiz_attempt = await self.repo.create(
            db,
            score=score,
            finished_at=finished_at,
            user_id=user_id,
            quiz_id=quiz_id
        )
        return quiz_attempt

    async def update(
        self,
        db: AsyncSession,
        quiz_attempt_id: str,
        *,
        score: Optional[float] = None,
        finished_at: Optional[dt.datetime] = None
    ) -> QuizAttempt:
        quiz_attempt = await self.get(db, quiz_attempt_id)

        quiz_attempt = await self.repo.update(
            db,
            quiz_attempt,
            score=score,
            finished_at=finished_at
        )
        return quiz_attempt

    async def delete(self, db: AsyncSession, quiz_attempt_id: str) -> None:
        quiz_attempt = await self.get(db, quiz_attempt_id)
        await self.repo.delete(db, quiz_attempt)


service = QuizAttemptService()
