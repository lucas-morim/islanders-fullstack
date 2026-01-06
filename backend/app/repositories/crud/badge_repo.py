from typing import Sequence, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from app.models.badges import Badge


class BadgeRepository:
    async def list(self, db: AsyncSession, skip: int = 0, limit: Optional[int] = None) -> Sequence[Badge]:
        stmt = select(Badge).offset(skip).order_by(Badge.min_score.asc())
        if limit is not None:
            stmt = stmt.limit(limit)
        res = await db.execute(stmt)
        return res.scalars().all()

    async def get(self, db: AsyncSession, badge_id: str) -> Optional[Badge]:
        return await db.get(Badge, badge_id)

    async def get_by_code(self, db: AsyncSession, code: str) -> Optional[Badge]:
        res = await db.execute(select(Badge).where(Badge.code == code))
        return res.scalar_one_or_none()

    async def create(self, db: AsyncSession, *, code: str, name: str, min_score: int, image: Optional[str] = None) -> Badge:
        obj = Badge(code=code, name=name, min_score=min_score, image=image)
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
        badge: Badge,
        *,
        name: Optional[str] = None,
        min_score: Optional[int] = None,
        image: Optional[str] = None,
    ) -> Badge:
        if name is not None:
            badge.name = name
        if min_score is not None:
            badge.min_score = min_score
        if image is not None:
            badge.image = image

        db.add(badge)
        try:
            await db.commit()
        except IntegrityError:
            await db.rollback()
            raise
        await db.refresh(badge)
        return badge

    async def delete(self, db: AsyncSession, badge: Optional[Badge]) -> bool:
        if not badge:
            return False
        await db.delete(badge)
        await db.commit()
        return True
