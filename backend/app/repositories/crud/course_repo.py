from typing import Sequence, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from sqlalchemy.orm import selectinload
from app.models.course import Course
from app.schemas.course import CourseCreate, CourseUpdate, StatusEnum

class CourseRepository:
    async def list(self, db: AsyncSession, skip: int = 0, limit: int = 100) -> Sequence[Course]:
        result = await db.execute(select(Course).options(selectinload(Course.areas)).offset(skip).limit(limit))
        return result.scalars().all()

    async def get(self, db: AsyncSession, course_id: str) -> Optional[Course]:
        return await db.get(Course, course_id)

    async def get_by_title(self, db: AsyncSession, title: str) -> Optional[Course]:
        result = await db.execute(select(Course).where(Course.title == title))
        return result.scalar_one_or_none()

    async def create(self, db: AsyncSession, *, obj_in: CourseCreate) -> Course:
        data = obj_in.model_dump(exclude_unset=True)
        data.pop("area_ids", None)

        course = Course(**data)
        db.add(course)
        await db.commit()
        await db.refresh(course)
        return course

    async def update(self, db: AsyncSession, *, course: Course, obj_in: CourseUpdate) -> Course:
        data = obj_in.model_dump(exclude_unset=True)
        data.pop("area_ids", None)

        for field, value in data.items():
            setattr(course, field, value)

        db.add(course)
        await db.commit()
        await db.refresh(course)
        return course

    async def delete(self, db: AsyncSession, course: Course) -> None:
        if not course:
            return None
        await db.delete(course)
        await db.commit()

    def _status_value(self, status: Optional[StatusEnum | str]) -> Optional[str]:
        if status is None:
            return None
        return status.value if isinstance(status, StatusEnum) else status

    async def export(
        self,
        db: AsyncSession,
        *,
        q: Optional[str] = None,
        area_id: Optional[str] = None,
        modality_id: Optional[str] = None,
        status: Optional[StatusEnum | str] = None,
    ) -> Sequence[Course]:
        stmt = (
            select(Course)
            .options(
                selectinload(Course.areas),
                selectinload(Course.modality),
            )
            .order_by(Course.created_at.desc())
        )

        if q:
            term = f"%{q.strip().lower()}%"
            stmt = stmt.where(Course.title.ilike(term))

        if modality_id:
            stmt = stmt.where(Course.modality_id == modality_id)

        if status:
            stmt = stmt.where(Course.status == self._status_value(status))

        if area_id:
            stmt = stmt.where(Course.areas.any(id=area_id))

        result = await db.execute(stmt)
        return result.scalars().all()
