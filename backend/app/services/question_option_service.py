from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.crud.question_option_repo import QuestionOptionRepository
from app.models.question_option import QuestionOption


class QuestionOptionService:

    def __init__(self, repo: QuestionOptionRepository = QuestionOptionRepository()):
        self.repo = repo

    async def sync_question_options(
        self,
        db: AsyncSession,
        *,
        question_id: str,
        option_ids: list[str],
        correct_option_id: str
    ) -> None:
        if correct_option_id not in option_ids:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Correct option must be one of the selected options"
            )

        if len(option_ids) > 4:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A question can have at most 4 options"
            )

        await self.repo.delete_by_question(db, question_id)

        items: list[QuestionOption] = []
        for option_id in option_ids:
            items.append(
                QuestionOption(
                    question_id=question_id,
                    option_id=option_id,
                    is_correct=(option_id == correct_option_id)
                )
            )

        await self.repo.bulk_create(db, items)

    async def list_by_question(
        self,
        db: AsyncSession,
        question_id: str
    ):
        return await self.repo.list_by_question(db, question_id)


service = QuestionOptionService()
