from typing import Sequence, Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import delete
from fastapi import HTTPException, status
from app.repositories.crud.area_repo import AreaRepository
from app.models.area import Area
from app.models.course import Course
from app.models.area_course import AreaCourse

class AreaService:
    def __init__(self):
        self.repo = AreaRepository()

    async def list(self, db: AsyncSession, skip: int = 0, limit: int = 100) -> Sequence[Area]:
        return await self.repo.list(db, skip=skip, limit=limit)
    
    async def get(self, db: AsyncSession, area_id: str) -> Area:
        area = await self.repo.get(db, area_id)
        if not area:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Area not found")
        return area
    
    async def create(
        self,
        db: AsyncSession,
        *,
        name: str,
        description: Optional[str] = None,
        course_ids: Optional[List[str]] = None
    ) -> Area:
        existing_area = await self.repo.get_by_name(db, name)
        if existing_area:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Area name must be unique")
        
        area = await self.repo.create(db, name=name, description=description)
        
        # criar associações com cursos
        if course_ids:
            for course_id in course_ids:
                db.add(AreaCourse(area_id=area.id, course_id=course_id))
            await db.commit()
        
        await db.refresh(area)
        return area

    async def update(
        self,
        db: AsyncSession,
        area_id: str,
        *,
        name: Optional[str] = None,
        description: Optional[str] = None,
        course_ids: Optional[List[str]] = None
    ) -> Area:
        area = await self.get(db, area_id)
        
        if name:
            existing_area = await self.repo.get_by_name(db, name)
            if existing_area and existing_area.id != area_id:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Area name must be unique")
        
        area = await self.repo.update(db, area, name=name, description=description)

        # atualiza associações muitos para muitos com cursos
        if course_ids is not None:
            # remover associações antigas
            stmt = delete(AreaCourse).where(AreaCourse.area_id == area.id)
            await db.execute(stmt)

            # criar novas associações
            for course_id in course_ids:
                db.add(AreaCourse(area_id=area.id, course_id=course_id))
            
            await db.commit()
            await db.refresh(area)
        
        return area
    
    async def delete(self, db: AsyncSession, area_id: str) -> None:
        area = await self.get(db, area_id)
        await self.repo.delete(db, area)

service = AreaService()
