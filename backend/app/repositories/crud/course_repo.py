from typing import Sequence, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.course import Course

class CourseRepository:
    async def list(self, db: AsyncSession, skip: int = 0, limit: int = 100) -> Sequence[Course]:
        result = await db.execute(select(Course).offset(skip).limit(limit))
        return result.scalars().all()

    async def get(self, db: AsyncSession, course_id: str) -> Optional[Course]:
        return await db.get(Course, course_id)

    async def get_by_title(self, db: AsyncSession, title: str) -> Optional[Course]:
        result = await db.execute(select(Course).where(Course.title == title))
        return result.scalar_one_or_none()

    async def create(self, db: AsyncSession, *, title: str, description: Optional[str] = None) -> Course:
        course = Course(title=title, description=description)
        db.add(course)
        await db.commit()
        await db.refresh(course)
        return course

    async def update(self, db: AsyncSession, course: Course, *, title: Optional[str] = None, description: Optional[str] = None) -> Course:
        if title is not None:
            course.title = title
        if description is not None:
            course.description = description

        db.add(course)
        await db.commit()
        await db.refresh(course)
        return course

    async def delete(self, db: AsyncSession, course: Course) -> None:
        if not course:
            return None
        await db.delete(course)
        await db.commit()