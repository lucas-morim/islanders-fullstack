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
from app.models.badges import Badge
from app.models.quiz_badge_award import QuizBadgeAward



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

    async def finish(self, db: AsyncSession, attempt_id: str) -> tuple[QuizAttempt, Badge | None]:
        attempt = await self.get(db, attempt_id)

        if attempt.finished_at is not None:
            return attempt, None

        total_q = await db.scalar(
            select(func.count(Question.id)).where(Question.quiz_id == attempt.quiz_id)
        )
        total_q = int(total_q or 0)

        if total_q == 0:
            raise HTTPException(status_code=400, detail="Quiz has no questions")

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

        badge_awarded = await self._award_badge_if_eligible(db, updated)

        return updated, badge_awarded

    async def _award_badge_if_eligible(
        self,
        db: AsyncSession,
        attempt: QuizAttempt,
    ) -> Badge | None:
        score = float(attempt.score)

        badge_code: str | None = None
        if score == 100:
            badge_code = "gold"
        elif score >= 80:
            badge_code = "silver"
        elif score >= 50:
            badge_code = "bronze"

        # < 50% => sem badge
        if badge_code is None:
            return None

        badge = await db.scalar(select(Badge).where(Badge.code == badge_code))
        if not badge:
            return None

        existing_award = await db.scalar(
            select(QuizBadgeAward).where(
                QuizBadgeAward.user_id == attempt.user_id,
                QuizBadgeAward.quiz_id == attempt.quiz_id,
            )
        )

        if not existing_award:
            new_award = QuizBadgeAward(
                user_id=attempt.user_id,
                quiz_id=attempt.quiz_id,
                badge_id=badge.id,
                attempt_id=attempt.id,
                awarded_at=datetime.now(timezone.utc),
            )
            db.add(new_award)
            await db.commit()
            return badge

        current_badge = await db.scalar(select(Badge).where(Badge.id == existing_award.badge_id))
        current_min = current_badge.min_score if current_badge else -1

        if badge.min_score > current_min:
            existing_award.badge_id = badge.id
            existing_award.attempt_id = attempt.id
            existing_award.awarded_at = datetime.now(timezone.utc)
            db.add(existing_award)
            await db.commit()
            return badge

        return None
    
    async def list_by_user(self, db: AsyncSession, user_id: str) -> Sequence[QuizAttempt]:
        return await self.repo.list_by_user(db, user_id)



service = QuizAttemptService()
