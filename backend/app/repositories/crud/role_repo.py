from typing import Sequence, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.role import Role

class RoleRepository:
    async def list(self, db: AsyncSession, skip: int = 0, limit: int = 100) -> Sequence[Role]:
        result = await db.execute(select(Role).offset(skip).limit(limit))
        return result.scalars().all()

    async def get(self, db: AsyncSession, role_id: str) -> Optional[Role]:
        return await db.get(Role, role_id)

    async def get_by_name(self, db: AsyncSession, name: str) -> Optional[Role]:
        result = await db.execute(select(Role).where(Role.name == name))
        return result.scalar_one_or_none()

    async def create(self, db: AsyncSession, *, name: str, description: Optional[str] = None) -> Role:
        role = Role(name=name, description=description)
        db.add(role)
        await db.commit()
        await db.refresh(role)
        return role

    async def update(self, db: AsyncSession, role: Role, *, name: Optional[str] = None, description: Optional[str] = None) -> Role:
        if not role:
            return None
        if name is not None:
            role.name = name
        if description is not None:
            role.description = description

        db.add(role)
        await db.commit()
        await db.refresh(role)
        return role

    async def delete(self, db: AsyncSession, role: Role) -> bool:
        if not role:
            return None
        await db.delete(role)
        await db.commit()
        return True
