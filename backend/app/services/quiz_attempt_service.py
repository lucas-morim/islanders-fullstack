from typing import Sequence, Optional
from datetime import datetime, timezone
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_

from app.repositories.crud.quiz_attempt_repo import QuizAttemptRepository
from app.models.quiz_attempt import QuizAttempt
from app.models.question import Question
from app.models.answer import Answer
from app.models.question_option import QuestionOption


class QuizAttemptService:
    def __init__(self):
        self.repo = QuizAttemptRepository()

    async def list(self, db: AsyncSession, skip: int = 0, limit: int = 100) -> Sequence[QuizAttempt]:
        return await self.repo.list(db, skip=skip, limit=limit)

    async def get(self, db: AsyncSession, attempt_id: str) -> QuizAttempt:
        attempt = await self.repo.get(db, attempt_id)
        if not attempt:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz attempt not found")
        return attempt

    async def create(self, db: AsyncSession, *, score: float, finished_at, user_id: str, quiz_id: str) -> QuizAttempt:
        return await self.repo.create(db, score=score, finished_at=finished_at, user_id=user_id, quiz_id=quiz_id)

    async def update(self, db: AsyncSession, attempt_id: str, *, score: Optional[float] = None, finished_at=None) -> QuizAttempt:
        attempt = await self.get(db, attempt_id)
        return await self.repo.update(db, attempt, score=score, finished_at=finished_at)

    async def delete(self, db: AsyncSession, attempt_id: str) -> None:
        attempt = await self.get(db, attempt_id)
        await self.repo.delete(db, attempt)

    async def finish(self, db: AsyncSession, attempt_id: str) -> QuizAttempt:
        attempt = await self.get(db, attempt_id)

        # se já finalizou, não recalcula
        if attempt.finished_at is not None:
            return attempt

        # total de questões do quiz
        total_q = await db.scalar(
            select(func.count(Question.id)).where(Question.quiz_id == attempt.quiz_id)
        )
        total_q = int(total_q or 0)

        if total_q == 0:
            raise HTTPException(status_code=400, detail="Quiz has no questions")

        # corretas = answers que batem com QuestionOption.is_correct == True
        correct = await db.scalar(
            select(func.count(Answer.id))
            .select_from(Answer)
            .join(
                QuestionOption,
                and_(
                    QuestionOption.question_id == Answer.question_id,
                    QuestionOption.option_id == Answer.option_id,
                )
            )
            .where(
                Answer.attempt_id == attempt.id,
                QuestionOption.is_correct.is_(True),
            )
        )
        correct = int(correct or 0)

        score = round((correct / total_q) * 100, 2)
        finished_at = datetime.now(timezone.utc)

        updated = await self.repo.update(db, attempt, score=score, finished_at=finished_at)
        return updated


service = QuizAttemptService()
