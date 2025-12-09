from typing import Sequence, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import delete
from fastapi import HTTPException, status

from app.repositories.crud.course_repo import CourseRepository
from app.models.course import Course
from app.models.area_course import AreaCourse
from app.schemas.course import CourseCreate, CourseUpdate

class CourseService:
    def __init__(self, repo: CourseRepository = CourseRepository()):
        self.repo = repo

    async def list(self, db: AsyncSession, skip: int = 0, limit: int = 100) -> Sequence[Course]:
        return await self.repo.list(db, skip=skip, limit=limit)
    
    async def get(self, db: AsyncSession, course_id: str) -> Course:
        course = await self.repo.get(db, course_id)
        if not course:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Course not found",
            )
        return course
    
    async def create(
        self,
        db: AsyncSession,
        *,
        obj_in: CourseCreate,
    ) -> Course:
        existing_course = await self.repo.get_by_title(db, obj_in.title)
        if existing_course:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Course title must be unique",
            )   

        course = await self.repo.create(db, obj_in=obj_in)

        if obj_in.area_ids:
            for area_id in obj_in.area_ids:
                db.add(AreaCourse(area_id=area_id, course_id=course.id))
            await db.commit()
            await db.refresh(course)

        return course

    async def update(
        self,
        db: AsyncSession,
        course_id: str,
        *,
        obj_in: CourseUpdate,
    ) -> Course:
        course = await self.get(db, course_id)

        if obj_in.title is not None:
            existing_course = await self.repo.get_by_title(db, obj_in.title)
            if existing_course and existing_course.id != course_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Course title must be unique",
                )

        course = await self.repo.update(db, course=course, obj_in=obj_in)

        if obj_in.area_ids is not None:
            stmt = delete(AreaCourse).where(AreaCourse.course_id == course.id)
            await db.execute(stmt)

            for area_id in obj_in.area_ids:
                db.add(AreaCourse(area_id=area_id, course_id=course.id))

            await db.commit()
            await db.refresh(course)

        return course
    
    async def delete(self, db: AsyncSession, course_id: str) -> None:
        course = await self.get(db, course_id)
        await self.repo.delete(db, course)


service = CourseService()
