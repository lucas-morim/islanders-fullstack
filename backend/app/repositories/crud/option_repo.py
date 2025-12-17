from typing import Sequence, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.option import Option


class OptionRepository:
    async def list(self, db: AsyncSession, *, skip: int = 0, limit: Optional[int] = None) -> Sequence[Option]:
        stmt = select(Option).offset(skip)

        if limit is not None:
            stmt = stmt.limit(limit)

        result = await db.execute(stmt)
        return result.scalars().all()

    async def get(self, db: AsyncSession, option_id: str) -> Optional[Option]:
        return await db.get(Option, option_id)

    async def get_by_text(self, db: AsyncSession, text: str) -> Option | None:
        stmt = select(Option).where(Option.text == text)
        res = await db.execute(stmt)
        return res.scalar_one_or_none()

    async def create(self, db: AsyncSession, *, text: str) -> Option:
        obj = Option(text=text)
        db.add(obj)
        await db.commit()
        await db.refresh(obj)
        return obj

    async def update(self, db: AsyncSession, option: Option, *, text: Optional[str] = None) -> Option:
        if text is not None:
            option.text = text
        db.add(option)
        await db.commit()
        await db.refresh(option)
        return option

    async def delete(self, db: AsyncSession, option: Option) -> bool:
        if not option:
            return None
        await db.delete(option)
        await db.commit()
        return True