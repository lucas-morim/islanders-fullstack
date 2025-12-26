from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

class DashboardRepository:

    async def summary(self, db: AsyncSession):
        users = await db.execute(text("SELECT COUNT(*) FROM users"))
        courses = await db.execute(text("SELECT COUNT(*) FROM courses"))
        quizzes = await db.execute(text("SELECT COUNT(*) FROM quizzes"))

        return {
            "users": users.scalar(),
            "courses": courses.scalar(),
            "quizzes": quizzes.scalar()
        }

    async def average_grade(self, db: AsyncSession, course_id: str | None = None, quiz_id: str | None = None):
        query = """
        SELECT ROUND(AVG(qa.score)::numeric, 2) AS avg_score
        FROM quiz_attempts qa
        JOIN quizzes q ON q.id = qa.quiz_id
        WHERE qa.finished_at IS NOT NULL
        """
        params = {}

        if course_id:
            query += " AND q.course_id = :course_id"
            params["course_id"] = course_id

        if quiz_id:
            query += " AND qa.quiz_id = :quiz_id"
            params["quiz_id"] = quiz_id

        result = await db.execute(text(query), params)
        return result.scalar() or 0.0

    async def grades_by_course(self, db: AsyncSession):
        query = """
        SELECT
        c.title AS label,
        ROUND(AVG(qa.score)::numeric, 2) AS value
        FROM quiz_attempts qa
        JOIN quizzes q ON q.id = qa.quiz_id
        JOIN courses c ON c.id = q.course_id
        WHERE qa.finished_at IS NOT NULL
        GROUP BY c.title
        ORDER BY c.title
        """

        result = await db.execute(text(query))
        return [{"label": r.label, "value": float(r.value)} for r in result.all()]


    async def grades_by_quiz(self, db: AsyncSession, course_id: str | None = None):
        query = """
        SELECT
        q.title AS label,
        ROUND(AVG(qa.score)::numeric, 2) AS value
        FROM quiz_attempts qa
        JOIN quizzes q ON q.id = qa.quiz_id
        WHERE qa.finished_at IS NOT NULL
        """
        params = {}

        if course_id:
            query += " AND q.course_id = :course_id"
            params["course_id"] = course_id

        query += " GROUP BY q.title ORDER BY q.title"

        result = await db.execute(text(query), params)
        return [{"label": r.label, "value": float(r.value)} for r in result.all()]



    async def grade_distribution(self, db: AsyncSession):
        query = """
        SELECT
        CASE
            WHEN score <= 20 THEN '0-20'
            WHEN score <= 40 THEN '21-40'
            WHEN score <= 60 THEN '41-60'
            WHEN score <= 80 THEN '61-80'
            ELSE '81-100'
        END AS range,
        COUNT(*) AS total
        FROM quiz_attempts
        WHERE finished_at IS NOT NULL
        GROUP BY range
        ORDER BY range
        """
        result = await db.execute(text(query))
        return {r.range: r.total for r in result.all()}

    async def grades_by_user(self, db: AsyncSession):
        query = """
        SELECT
        u.name AS label,
        ROUND(AVG(qa.score)::numeric, 2) AS value
        FROM quiz_attempts qa
        JOIN users u ON u.id = qa.user_id
        WHERE qa.finished_at IS NOT NULL
        GROUP BY u.name
        ORDER BY u.name
        """
        result = await db.execute(text(query))
        return [{"label": r.label, "value": float(r.value)} for r in result.all()]
