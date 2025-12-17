from typing import Sequence, Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import delete
from fastapi import HTTPException, status
from app.repositories.crud.question_repo import QuestionRepository
from app.models.question import Question
from app.models.question_option import QuestionOption


class QuestionService:
    def __init__(self, repo=QuestionRepository()):
        self.repo = repo

    async def list(self, db: AsyncSession, skip: int = 0, limit: Optional[int] = None) -> Sequence[Question]:
        return await self.repo.list(db, skip=skip, limit=limit)

    async def get(self, db: AsyncSession, question_id: str) -> Question:
        question = await self.repo.get(db, question_id)
        if not question:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")
        return question

    async def create(
        self,
        db: AsyncSession,
        *,
        text: str,
        quiz_id: str,
        option_ids: Optional[List[str]] = None
    ) -> Question:
        existing_question = await self.repo.get_by_text(db, text)
        if existing_question:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Question text must be unique")

        question = await self.repo.create(db, text=text, quiz_id=quiz_id)

        # associar opções se existirem
        if option_ids:
            for option_id in option_ids:
                db.add(QuestionOption(question_id=question.id, option_id=option_id))
            await db.commit()

        await db.refresh(question)
        return question

    async def update(
        self,
        db: AsyncSession,
        question_id: str,
        *,
        text: Optional[str] = None,
        quiz_id: Optional[str] = None,
        option_ids: Optional[List[str]] = None
    ) -> Question:
        question = await self.get(db, question_id)

        if text:
            existing_question = await self.repo.get_by_text(db, text)
            if existing_question and existing_question.id != question_id:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Question text must be unique")

        question = await self.repo.update(db, question, text=text, quiz_id=quiz_id)

        # atualizar opções associadas
        if option_ids is not None:
            stmt = delete(QuestionOption).where(QuestionOption.question_id == question.id)
            await db.execute(stmt)

            for option_id in option_ids:
                db.add(QuestionOption(question_id=question.id, option_id=option_id))

            await db.commit()
            await db.refresh(question)

        return question

    async def delete(self, db: AsyncSession, question_id: str) -> None:
        question = await self.get(db, question_id)
        await self.repo.delete(db, question)


service = QuestionService()