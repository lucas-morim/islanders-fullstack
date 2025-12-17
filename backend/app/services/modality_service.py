from typing import Sequence, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from app.repositories.crud.modality_repo import ModalityRepository
from app.models.modality import Modality

class ModalityService:
    def __init__(self, repo= ModalityRepository()):
        self.repo = repo

    async def list(self, db: AsyncSession, skip: int = 0, limit: Optional[int] = None) -> Sequence[Modality]:
        return await self.repo.list(db, skip=skip, limit=limit)
    
    async def get(self, db: AsyncSession, modality_id: str) -> Modality:
        modality = await self.repo.get(db, modality_id)
        if not modality:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Modality not found"
            )
        return modality
    
    async def create(self, db: AsyncSession, *, name: str, description: Optional[str] = None) -> Modality:
        existing_modality = await self.repo.get_by_name(db, name)
        if existing_modality:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Modality name must be unique"
            )
        return await self.repo.create(db, name=name, description=description)

    async def update(self, db: AsyncSession, modality_id: str, *, name: Optional[str] = None, description: Optional[str] = None) -> Modality:
        modality = await self.get(db, modality_id)
        if name:
            existing_modality = await self.repo.get_by_name(db, name)
            if existing_modality and existing_modality.id != modality_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Modality name must be unique"
                )
        return await self.repo.update(db, modality, name=name, description=description)
    
    async def delete(self, db: AsyncSession, modality_id: str) -> None:
        modality = await self.get(db, modality_id)
        await self.repo.delete(db, modality)
        
service = ModalityService()
