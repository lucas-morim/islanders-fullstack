from typing import Sequence, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.modality import Modality

class ModalityRepository:
    async def list(self, db: AsyncSession, skip: int = 0, limit: Optional[int] = 100) -> Sequence[Modality]:
        stmt = select(Modality).offset(skip)

        if limit is not None:
            stmt = stmt.limit(limit)
            
        result = await db.execute(stmt)
        return result.scalars().all()

    async def get(self, db: AsyncSession, modality_id: str) -> Optional[Modality]:
        return await db.get(Modality, modality_id)

    async def get_by_name(self, db: AsyncSession, name: str) -> Optional[Modality]:
        result = await db.execute(select(Modality).where(Modality.name == name))
        return result.scalar_one_or_none()

    async def create(self, db: AsyncSession, *, name: str, description: Optional[str] = None) -> Modality:
        modality = Modality(name=name, description=description)
        db.add(modality)
        await db.commit()
        await db.refresh(modality)
        return modality

    async def update(self, db: AsyncSession, modality: Modality, *, name: Optional[str] = None, description: Optional[str] = None) -> Modality:
        if not modality:
            return None
        if name is not None:
            modality.name = name
        if description is not None:
            modality.description = description

        db.add(modality)
        await db.commit()
        await db.refresh(modality)
        return modality

    async def delete(self, db: AsyncSession, modality: Modality) -> bool:
        if not modality:
            return None
        await db.delete(modality)
        await db.commit()
        return True