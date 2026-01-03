from typing import Sequence, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from app.repositories.crud.role_repo import RoleRepository
from app.models.role import Role

class RoleService:
    def __init__(self, repo= RoleRepository()):
        self.repo = repo

    async def list(self, db: AsyncSession, skip: int = 0, limit: Optional[int] = None) -> Sequence[Role]:
        return await self.repo.list(db, skip=skip, limit=limit)
    
    async def get(self, db: AsyncSession, role_id: str) -> Role:
        role = await self.repo.get(db, role_id)
        if not role:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Role not found"
            )
        return role
    
    async def create(self, db: AsyncSession, *, name: str, description: Optional[str] = None) -> Role:
        existing_role = await self.repo.get_by_name(db, name)
        if existing_role:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Role name must be unique"
            )
        return await self.repo.create(db, name=name, description=description)

    async def update(self, db: AsyncSession, role_id: str, *, name: Optional[str] = None, description: Optional[str] = None) -> Role:
        role = await self.get(db, role_id)
        if name:
            existing_role = await self.repo.get_by_name(db, name)
            if existing_role and existing_role.id != role_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Role name must be unique"
                )
        return await self.repo.update(db, role, name=name, description=description)
    
    async def delete(self, db: AsyncSession, role_id: str) -> None:
        role = await self.get(db, role_id)
        await self.repo.delete(db, role)
        
service = RoleService()
