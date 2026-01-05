from typing import Sequence, Optional
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.crud.badge_repo import BadgeRepository
from app.models.badges import Badge


class BadgeService:
    def __init__(self, repo: BadgeRepository = BadgeRepository()):
        self.repo = repo

    async def list(self, db: AsyncSession, skip: int = 0, limit: Optional[int] = None) -> Sequence[Badge]:
        return await self.repo.list(db, skip=skip, limit=limit)

    async def get(self, db: AsyncSession, badge_id: str) -> Badge:
        obj = await self.repo.get(db, badge_id)
        if not obj:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Badge not found")
        return obj

    async def create(self, db: AsyncSession, *, code: str, name: str, min_score: int, image: Optional[str] = None) -> Badge:
        if await self.repo.get_by_code(db, code):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Badge code must be unique")
        return await self.repo.create(db, code=code, name=name, min_score=min_score, image=image)

    async def update(self, db: AsyncSession, badge_id: str, *, name: Optional[str] = None, min_score: Optional[int] = None, image: Optional[str] = None) -> Badge:
        badge = await self.get(db, badge_id)
        return await self.repo.update(db, badge, name=name, min_score=min_score, image=image)

    async def delete(self, db: AsyncSession, badge_id: str) -> None:
        badge = await self.get(db, badge_id)
        await self.repo.delete(db, badge)


service = BadgeService()
