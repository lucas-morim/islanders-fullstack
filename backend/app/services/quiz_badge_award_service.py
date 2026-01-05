from typing import Sequence, Optional
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.crud.quiz_badge_award_repo import QuizBadgeAwardRepository
from app.repositories.crud.badge_repo import BadgeRepository
from app.models.quiz_badge_award import QuizBadgeAward


class QuizBadgeAwardService:
    def __init__(
        self,
        repo: QuizBadgeAwardRepository = QuizBadgeAwardRepository(),
        badge_repo: BadgeRepository = BadgeRepository(),
    ):
        self.repo = repo
        self.badge_repo = badge_repo

    async def list(self, db: AsyncSession, skip: int = 0, limit: Optional[int] = None) -> Sequence[QuizBadgeAward]:
        return await self.repo.list(db, skip=skip, limit=limit)

    async def get(self, db: AsyncSession, award_id: str) -> QuizBadgeAward:
        obj = await self.repo.get(db, award_id)
        if not obj:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Badge award not found")
        return obj

    async def list_by_user(self, db: AsyncSession, user_id: str) -> Sequence[QuizBadgeAward]:
        return await self.repo.list_by_user(db, user_id)

    async def upsert_best(
        self,
        db: AsyncSession,
        *,
        user_id: str,
        quiz_id: str,
        badge_id: str,
        attempt_id: Optional[str] = None,
    ) -> QuizBadgeAward:
        new_badge = await self.badge_repo.get(db, badge_id)
        if not new_badge:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid badge_id")

        current = await self.repo.get_by_user_quiz(db, user_id, quiz_id)

        if not current:
            return await self.repo.create(
                db,
                user_id=user_id,
                quiz_id=quiz_id,
                badge_id=badge_id,
                attempt_id=attempt_id,
            )

        old_badge = await self.badge_repo.get(db, current.badge_id)
        old_min = old_badge.min_score if old_badge else -1

        if new_badge.min_score > old_min:
            return await self.repo.update(
                db,
                current,
                badge_id=badge_id,
                attempt_id=attempt_id,
            )

        return current

    async def delete(self, db: AsyncSession, award_id: str) -> None:
        award = await self.get(db, award_id)
        await self.repo.delete(db, award)


service = QuizBadgeAwardService()
