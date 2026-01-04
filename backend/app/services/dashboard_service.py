from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.crud.dashboard_repo import DashboardRepository

class DashboardService:
    def __init__(self, repo: DashboardRepository = DashboardRepository()):
        self.repo = repo

    async def get_summary(self, db: AsyncSession):
        return await self.repo.summary(db)

    async def get_average_grade(self, db: AsyncSession, course_id: str | None = None, quiz_id: str | None = None):
        avg = await self.repo.average_grade(db, course_id, quiz_id)
        return {"average": avg}

    async def get_grades_by_course(self, db: AsyncSession):
        return await self.repo.grades_by_course(db)

    async def get_grades_by_quiz(self, db: AsyncSession, course_id: str | None = None):
        return await self.repo.grades_by_quiz(db, course_id)

    async def get_grade_distribution(self, db: AsyncSession):
        return {"distribution": await self.repo.grade_distribution(db)}
    
    async def get_grades_by_user(self, db: AsyncSession):
        return await self.repo.grades_by_user(db)
    
    async def top_students(self, db: AsyncSession, limit: int = 5):
        # proxy simples para o repo; evita erros se o repo implementar a lógica real
        if hasattr(self.repo, "top_students"):
            return await self.repo.top_students(db, limit)
        # fallback seguro
        return []

    async def get_users_over_time(self, db: AsyncSession, range_key: str = "1m", role_id: str | None = None):
        return await self.repo.users_over_time(db, range_key, role_id)

    async def get_quiz_attempts_over_time(self, db: AsyncSession, range_key: str = "1m", quiz_id: str | None = None):
        return await self.repo.quiz_attempts_over_time(db, range_key, quiz_id)

service = DashboardService()