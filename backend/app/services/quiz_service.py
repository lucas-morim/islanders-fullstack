from typing import Sequence, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from app.repositories.crud.quiz_repo import QuizRepository
from app.models.quiz import Quiz


class QuizService:
    def __init__(self):
        self.repo = QuizRepository()

    async def list(
        self,
        db: AsyncSession,
        skip: int = 0,
        limit: int = 100
    ) -> Sequence[Quiz]:
        return await self.repo.list(db, skip=skip, limit=limit)

    async def get(self, db: AsyncSession, quiz_id: str) -> Quiz:
        quiz = await self.repo.get(db, quiz_id)
        if not quiz:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Quiz not found"
            )
        return quiz

    async def create(
        self,
        db: AsyncSession,
        *,
        title: str,
        description: Optional[str],
        user_id: Optional[str],
        course_id: str,
        video_id: Optional[str] = None,
    ) -> Quiz:
        existing_quiz = await self.repo.get_by_title(db, title)
        if existing_quiz:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Quiz title must be unique"
            )

        quiz = await self.repo.create(
            db,
            title=title,
            description=description,
            user_id=user_id or None,      # '' -> None
            course_id=course_id,
            video_id=video_id or None,    # '' -> None
        )
        return quiz

    async def update(
        self,
        db: AsyncSession,
        quiz_id: str,
        *,
        title: Optional[str] = None,
        description: Optional[str] = None,
        course_id: Optional[str] = None,
        video_id: Optional[str] = None,
    ) -> Quiz:
        quiz = await self.get(db, quiz_id)

        if title:
            existing_quiz = await self.repo.get_by_title(db, title)
            if existing_quiz and existing_quiz.id != quiz_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Quiz title must be unique"
                )

        quiz = await self.repo.update(
            db,
            quiz,
            title=title,
            description=description,
            course_id=course_id,
            video_id=video_id,
        )
        return quiz

    async def delete(self, db: AsyncSession, quiz_id: str) -> None:
        quiz = await self.get(db, quiz_id)
        await self.repo.delete(db, quiz)


service = QuizService()
