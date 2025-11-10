from typing import Sequence, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from app.models.area import Area

class AreaRepository:
    async def list(self, db: AsyncSession, *, skip: int = 0, limit: int = 100) -> Sequence[Area]:
        result = await db.execute(select(Area).offset(skip).limit(limit))
        return result.scalars().all()
    
    async def get(self, db: AsyncSession, area_id: str) -> Optional[Area]:
        return await db.get(Area, area_id)
    
    async def get_by_name(self, db: AsyncSession, name: str) -> Area | None:
        stmt = select(Area).where(Area.name == name)
        res = await db.execute(stmt)
        return res.scalar_one_or_none()
    
    async def create(self, db: AsyncSession, *, name: str, description: Optional [str]) -> Area:
        obj = Area(name=name, description=description)
        db.add(obj)
        await db.commit()
        await db.refresh(obj)
        return obj
    
    async def update(self, db: AsyncSession, area: Area, *, name: Optional[str] = None, description: Optional[str] = None) -> Area:
        if name is not None:
            area.name = name
        if description is not None:
            area.description = description
        db.add(area)
        await db.commit()
        await db.refresh(area)
        return area
    
    async def delete(self, db: AsyncSession, area: Area) -> bool:
        if not area:
            return None
        await db.delete(area)
        await db.commit()