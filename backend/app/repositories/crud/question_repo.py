from typing import Sequence, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.question import Question


class QuestionRepository:
    async def list(self, db: AsyncSession, *, skip: int = 0, limit: int = 100) -> Sequence[Question]:
        result = await db.execute(select(Question).offset(skip).limit(limit))
        return result.scalars().all()

    async def get(self, db: AsyncSession, question_id: str) -> Optional[Question]:
        return await db.get(Question, question_id)

    async def get_by_text(self, db: AsyncSession, text: str) -> Optional[Question]:
        result = await db.execute(select(Question).where(Question.text == text))
        return result.scalar_one_or_none()

    async def create(self, db: AsyncSession, *, text: str, quiz_id: str) -> Question:
        question = Question(text=text, quiz_id=quiz_id)
        db.add(question)
        await db.commit()
        await db.refresh(question)
        return question

    async def update(
        self,
        db: AsyncSession,
        question: Question,
        *,
        text: Optional[str] = None,
        quiz_id: Optional[str] = None
    ) -> Question:
        if text is not None:
            question.text = text
        if quiz_id is not None:
            question.quiz_id = quiz_id

        db.add(question)
        await db.commit()
        await db.refresh(question)
        return question

    async def delete(self, db: AsyncSession, question: Question) -> None:
        if not question:
            return None
        await db.delete(question)
        await db.commit()
