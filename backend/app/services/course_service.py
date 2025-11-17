from typing import Sequence, Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import delete
from fastapi import HTTPException, status
from app.repositories.crud.course_repo import CourseRepository
from app.models.course import Course
from app.models.area_course import AreaCourse

class CourseService:
    def __init__(self, repo=CourseRepository()):
        self.repo = repo

    async def list(self, db: AsyncSession, skip: int = 0, limit: int = 100) -> Sequence[Course]:
        return await self.repo.list(db, skip=skip, limit=limit)
    
    async def get(self, db: AsyncSession, course_id: str) -> Course:
        course = await self.repo.get(db, course_id)
        if not course:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
        return course
    
    async def create(
        self,
        db: AsyncSession,
        *,
        title: str,
        description: Optional[str] = None,
        area_ids: Optional[List[str]] = None
    ) -> Course:
        existing_course = await self.repo.get_by_title(db, title)
        if existing_course:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Course title must be unique")
        
        course = await self.repo.create(db, title=title, description=description)

        # associações muitos para muitos com Areas
        if area_ids:
            for area_id in area_ids:
                db.add(AreaCourse(area_id=area_id, course_id=course.id))
            await db.commit()
        
        await db.refresh(course)
        return course

    async def update(
        self,
        db: AsyncSession,
        course_id: str,
        *,
        title: Optional[str] = None,
        description: Optional[str] = None,
        area_ids: Optional[List[str]] = None
    ) -> Course:
        course = await self.get(db, course_id)
        
        # valida título único
        if title:
            existing_course = await self.repo.get_by_title(db, title)
            if existing_course and existing_course.id != course_id:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Course title must be unique")
        
        course = await self.repo.update(db, course, title=title, description=description)
        
        # atualizar associações muitos para muitos com Areas
        if area_ids is not None:
            # remover associações antigas
            stmt = delete(AreaCourse).where(AreaCourse.course_id == course.id)
            await db.execute(stmt)

            # criar novas associações
            for area_id in area_ids:
                db.add(AreaCourse(area_id=area_id, course_id=course.id))
            
            await db.commit()
            await db.refresh(course)
        
        return course
    
    async def delete(self, db: AsyncSession, course_id: str) -> None:
        course = await self.get(db, course_id)
        await self.repo.delete(db, course)

service = CourseService()
