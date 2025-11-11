from typing import Sequence, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from app.repositories.crud.option_repo import OptionRepository
from app.models.option import Option


class OptionService:
    def __init__(self):
        self.repo = OptionRepository()

    async def list(self, db: AsyncSession, skip: int = 0, limit: int = 100) -> Sequence[Option]:
        return await self.repo.list(db, skip=skip, limit=limit)

    async def get(self, db: AsyncSession, option_id: str) -> Option:
        option = await self.repo.get(db, option_id)
        if not option:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Option not found"
            )
        return option

    async def create(self, db: AsyncSession, *, text: str) -> Option:
        existing_option = await self.repo.get_by_text(db, text)
        if existing_option:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Option text must be unique"
            )

        option = await self.repo.create(db, text=text)
        return option

    async def update(self, db: AsyncSession, option_id: str, *, text: Optional[str] = None) -> Option:
        option = await self.get(db, option_id)

        if text:
            existing_option = await self.repo.get_by_text(db, text)
            if existing_option and existing_option.id != option_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Option text must be unique"
                )

        option = await self.repo.update(db, option, text=text)
        return option

    async def delete(self, db: AsyncSession, option_id: str) -> None:
        option = await self.get(db, option_id)
        await self.repo.delete(db, option)


service = OptionService()
