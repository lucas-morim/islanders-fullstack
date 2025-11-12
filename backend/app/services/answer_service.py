from typing import Sequence, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from app.repositories.crud.answer_repo import AnswerRepository
from app.models.answer import Answer


class AnswerService:
    def __init__(self):
        self.repo = AnswerRepository()

    async def list(self, db: AsyncSession, skip: int = 0, limit: int = 100) -> Sequence[Answer]:
        return await self.repo.list(db, skip=skip, limit=limit)

    async def get(self, db: AsyncSession, answer_id: str) -> Answer:
        answer = await self.repo.get(db, answer_id)
        if not answer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Answer not found"
            )
        return answer

    async def create(
        self,
        db: AsyncSession,
        *,
        attempt_id: str,
        question_id: str,
        option_id: Optional[str] = None
    ) -> Answer:
        return await self.repo.create(
            db,
            attempt_id=attempt_id,
            question_id=question_id,
            option_id=option_id,
        )

    async def update(
        self,
        db: AsyncSession,
        answer_id: str,
        *,
        option_id: Optional[str] = None
    ) -> Answer:
        answer = await self.get(db, answer_id)
        return await self.repo.update(db, answer, option_id=option_id)

    async def delete(self, db: AsyncSession, answer_id: str) -> None:
        answer = await self.get(db, answer_id)
        await self.repo.delete(db, answer)


service = AnswerService()
