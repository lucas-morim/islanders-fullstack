from typing import List
from unittest import result
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends, Query

from app.core.deps import get_db
from app.schemas.dashboard import LabelValue
from sqlalchemy import select, func
from app.models.course import Course
from app.models.area import Area
from app.models.area_course import AreaCourse

from sqlalchemy import text

from app import db

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
    
    async def top_students(self, db: AsyncSession, limit: int = 5):
        query = """
        SELECT
            u.name AS label,
            ROUND(AVG(qa.score)::numeric, 2) AS value
        FROM quiz_attempts qa
        JOIN users u ON u.id = qa.user_id
        WHERE qa.finished_at IS NOT NULL
        GROUP BY u.id, u.name
        HAVING COUNT(qa.id) >= 1
        ORDER BY value DESC
        LIMIT :limit
        """

        result = await db.execute(text(query), {"limit": limit})
        return [{"label": r.label, "value": float(r.value)} for r in result.all()]

    async def users_over_time(self, db: AsyncSession, range_key: str = "1m", role_id: str | None = None):
        """
        range_key: "1m" | "6m" | "1y"
        1m => agrupamento por dia
        6m/1y => agrupamento por mês
        Filtra por users.role_id quando fornecido.
        """
        if range_key == "1m":
            trunc = "day"
            fmt = "YYYY-MM-DD"
            interval = "1 month"
        else:
            trunc = "month"
            fmt = "YYYY-MM"
            interval = "6 months" if range_key == "6m" else "1 year"

        sql = f"""
        SELECT to_char(date_trunc('{trunc}', u.created_at), '{fmt}') AS label,
               COUNT(*)::int AS value
        FROM users u
        WHERE u.created_at >= now() - interval '{interval}'
        """

        params: dict = {}
        if role_id:
            sql += " AND u.role_id = :role_id"
            params["role_id"] = role_id

        # DEBUG: opcionalmente retornamos params para ver se chegou (remover depois)
        # print("DEBUG users_over_time params=", params)

        sql += f" GROUP BY date_trunc('{trunc}', u.created_at) ORDER BY label"

        result = await db.execute(text(sql), params)
        rows = result.all()
        return [{"label": r.label, "value": int(r.value)} for r in rows]

    async def quiz_attempts_over_time(self, db: AsyncSession, range_key: str = "1m", quiz_id: str | None = None):
        """
        Agrupa tentativas por day (1m) ou month (6m/1y) usando quiz_attempts.finished_at (coluna existente).
        range_key: "1m" | "6m" | "1y"
        """
        if range_key == "1m":
            trunc = "day"
            fmt = "YYYY-MM-DD"
            interval = "1 month"
        else:
            trunc = "month"
            fmt = "YYYY-MM"
            interval = "6 months" if range_key == "6m" else "1 year"

        sql = f"""
        SELECT to_char(date_trunc('{trunc}', qa.finished_at), '{fmt}') AS label,
               COUNT(*)::int AS value
        FROM quiz_attempts qa
        WHERE qa.finished_at IS NOT NULL
          AND qa.finished_at >= now() - interval '{interval}'
        """

        params: dict = {}
        if quiz_id:
            sql += " AND qa.quiz_id = :quiz_id"
            params["quiz_id"] = quiz_id

        sql += f" GROUP BY date_trunc('{trunc}', qa.finished_at) ORDER BY label"

        try:
            result = await db.execute(text(sql), params)
            rows = result.all()
            return [{"label": r.label, "value": int(r.value)} for r in rows]
        except Exception:
            import logging
            logging.exception("quiz_attempts_over_time SQL failed")
            return []

    async def courses_by_area(self, db: AsyncSession):
        stmt = (
            select(
                Area.name.label("label"),
                func.count(Course.id).label("value")
            )
            .outerjoin(AreaCourse, AreaCourse.area_id == Area.id)
            .outerjoin(Course, Course.id == AreaCourse.course_id)
            .group_by(Area.name)
            .order_by(func.count(Course.id).desc())
        )


        result = await db.execute(stmt)
        return [{"label": r.label, "value": int(r.value)} for r in result.all()]
