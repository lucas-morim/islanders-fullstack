from typing import Sequence, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from app.repositories.crud.quiz_repo import QuizRepository
from app.models.quiz import Quiz
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.schemas.quiz_full import QuizFullOut, QuestionFull, OptionMini


class QuizService:
    def __init__(self):
        self.repo = QuizRepository()

    async def list(
        self,
        db: AsyncSession,
        skip: int = 0,
        limit: Optional[int] = None
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
            user_id=user_id or None,      
            course_id=course_id,
            video_id=video_id or None,    
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

    async def get_by_course(self, db: AsyncSession, course_id: str) -> Quiz:
        result = await db.execute(select(Quiz).where(Quiz.course_id == course_id))
        quiz = result.scalar_one_or_none()
        if not quiz:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz not found for this course")
        return quiz
    
    async def get_full(self, db: AsyncSession, quiz_id: str) -> QuizFullOut:
        result = await db.execute(
            select(Quiz)
            .where(Quiz.id == quiz_id)
            .options(
                selectinload(Quiz.questions)
                .selectinload("question_options")
                .selectinload("option")
            )
        )
        quiz = result.scalar_one_or_none()
        if not quiz:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz not found")

        questions_out: list[QuestionFull] = []
        for q in quiz.questions:
            opts = []
            for qo in q.question_options:
                if qo.option:
                    opts.append(OptionMini(id=qo.option.id, text=qo.option.text))
            questions_out.append(QuestionFull(id=q.id, text=q.text, options=opts))

        return QuizFullOut(quiz=quiz, questions=questions_out)


service = QuizService()
