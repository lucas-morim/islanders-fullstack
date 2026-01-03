from typing import Sequence, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.quiz import Quiz


class QuizRepository:
    async def list(
        self,
        db: AsyncSession,
        *,
        skip: int = 0,
        limit: Optional[int] = None
    ) -> Sequence[Quiz]:
        stmt = select(Quiz).offset(skip)

        if limit is not None:
            stmt = stmt.limit(limit)

        result = await db.execute(stmt)
        return result.scalars().all()

    async def get(self, db: AsyncSession, quiz_id: str) -> Optional[Quiz]:
        return await db.get(Quiz, quiz_id)

    async def get_by_title(self, db: AsyncSession, title: str) -> Quiz | None:
        stmt = select(Quiz).where(Quiz.title == title)
        res = await db.execute(stmt)
        return res.scalar_one_or_none()

    async def create(
        self,
        db: AsyncSession,
        *,
        title: str,
        description: Optional[str] = None,
        user_id: Optional[str] = None,
        course_id: str,
        video_id: Optional[str] = None,
    ) -> Quiz:
        obj = Quiz(
            title=title,
            description=description,
            user_id=user_id,      # None -> NULL no banco
            course_id=course_id,
            video_id=video_id,    # None -> NULL também
        )
        db.add(obj)
        await db.commit()
        await db.refresh(obj)
        return obj

    async def update(
        self,
        db: AsyncSession,
        quiz: Quiz,
        *,
        title: Optional[str] = None,
        description: Optional[str] = None,
        course_id: Optional[str] = None,
        video_id: Optional[str] = None,
    ) -> Quiz:
        if title is not None:
            quiz.title = title
        if description is not None:
            quiz.description = description
        if course_id is not None:
            quiz.course_id = course_id

        quiz.video_id = video_id

        db.add(quiz)
        await db.commit()
        await db.refresh(quiz)
        return quiz


    async def delete(self, db: AsyncSession, quiz: Quiz) -> bool:
        if not quiz:
            return False
        await db.delete(quiz)
        await db.commit()
        return True
