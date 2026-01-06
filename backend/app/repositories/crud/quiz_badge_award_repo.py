from typing import Sequence, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import selectinload
from app.models.quiz_badge_award import QuizBadgeAward


class QuizBadgeAwardRepository:
    async def list(self, db: AsyncSession, skip: int = 0, limit: Optional[int] = None) -> Sequence[QuizBadgeAward]:
        stmt = select(QuizBadgeAward).offset(skip).order_by(QuizBadgeAward.awarded_at.desc())
        if limit is not None:
            stmt = stmt.limit(limit)
        res = await db.execute(stmt)
        return res.scalars().all()

    async def get(self, db: AsyncSession, award_id: str) -> Optional[QuizBadgeAward]:
        stmt = (
            select(QuizBadgeAward)
            .options(selectinload(QuizBadgeAward.badge))
            .where(QuizBadgeAward.id == award_id)
        )
        res = await db.execute(stmt)
        return res.scalar_one_or_none()


    async def get_by_user_quiz(self, db: AsyncSession, user_id: str, quiz_id: str) -> Optional[QuizBadgeAward]:
        stmt = select(QuizBadgeAward).where(
            QuizBadgeAward.user_id == user_id,
            QuizBadgeAward.quiz_id == quiz_id,
        )
        res = await db.execute(stmt)
        return res.scalar_one_or_none()


    async def list_by_user(self, db: AsyncSession, user_id: str):
        stmt = (
        select(QuizBadgeAward)
        .where(QuizBadgeAward.user_id == user_id)
        .options(
            selectinload(QuizBadgeAward.badge),
            selectinload(QuizBadgeAward.quiz),
            selectinload(QuizBadgeAward.attempt),
        )
        .order_by(QuizBadgeAward.awarded_at.desc())
        )
        res = await db.execute(stmt)
        return res.scalars().all()



    async def create(
        self,
        db: AsyncSession,
        *,
        user_id: str,
        quiz_id: str,
        badge_id: str,
        attempt_id: Optional[str] = None,
    ) -> QuizBadgeAward:
        obj = QuizBadgeAward(
            user_id=user_id,
            quiz_id=quiz_id,
            badge_id=badge_id,
            attempt_id=attempt_id,
        )
        db.add(obj)
        try:
            await db.commit()
        except IntegrityError:
            await db.rollback()
            raise
        await db.refresh(obj)
        return obj

    async def update(
        self,
        db: AsyncSession,
        award: QuizBadgeAward,
        *,
        badge_id: str,
        attempt_id: Optional[str] = None,
    ) -> QuizBadgeAward:
        award.badge_id = badge_id
        award.attempt_id = attempt_id
        db.add(award)
        try:
            await db.commit()
        except IntegrityError:
            await db.rollback()
            raise
        await db.refresh(award)
        return award

    async def delete(self, db: AsyncSession, award: Optional[QuizBadgeAward]) -> bool:
        if not award:
            return False
        await db.delete(award)
        await db.commit()
        return True
