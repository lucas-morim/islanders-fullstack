from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.services.dashboard_service import service as dashboard_service
from app.core.deps import get_db
from app.schemas.dashboard import SummaryOut, AverageGradeOut, LabelValue, GradeDistributionOut

router = APIRouter()

@router.get("/summary", response_model=SummaryOut)
async def get_summary(db: AsyncSession = Depends(get_db)):
    return await dashboard_service.get_summary(db)

@router.get("/average-grade", response_model=AverageGradeOut)
async def get_average_grade(
    course_id: str = None, quiz_id: str = None,
    db: AsyncSession = Depends(get_db)
):
    return await dashboard_service.get_average_grade(db, course_id, quiz_id)

@router.get("/grades-by-course", response_model=List[LabelValue])
async def get_grades_by_course(db: AsyncSession = Depends(get_db)):
    return await dashboard_service.get_grades_by_course(db)

@router.get("/grades-by-quiz", response_model=List[LabelValue])
async def get_grades_by_quiz(
    course_id: str = None,
    db: AsyncSession = Depends(get_db)
):
    return await dashboard_service.get_grades_by_quiz(db, course_id)

@router.get("/grade-distribution", response_model=List[GradeDistributionOut])
async def get_grade_distribution(db: AsyncSession = Depends(get_db)):
    dist = await dashboard_service.get_grade_distribution(db)
    # transforma dict em lista de objetos
    return [{"range": k, "total": v} for k, v in dist["distribution"].items()]

@router.get("/grades-by-user", response_model=List[LabelValue])
async def get_grades_by_user(db: AsyncSession = Depends(get_db)):
    return await dashboard_service.get_grades_by_user(db)

@router.get("/users-over-time", response_model=List[LabelValue])
async def users_over_time(
    range: str = Query("1m", regex="^(1m|6m|1y)$"),
    role_id: str | None = None,
    db: AsyncSession = Depends(get_db)
):
    """
    - range: 1m | 6m | 1y
      * 1m => agrupamento por dia
      * 6m/1y => agrupamento por mês
    - role_id: filtra por users.role_id (UUID)
    """
    return await dashboard_service.get_users_over_time(db, range, role_id)

@router.get("/quiz-attempts-over-time", response_model=List[LabelValue])
async def quiz_attempts_over_time(
    range: str = Query("1m", regex="^(1m|6m|1y)$"),
    quiz_id: str | None = None,
    db: AsyncSession = Depends(get_db)
):
    return await dashboard_service.get_quiz_attempts_over_time(db, range, quiz_id)

@router.get("/top-students", response_model=List[LabelValue])
async def get_top_students(limit: int = Query(5, ge=1), db: AsyncSession = Depends(get_db)):
    return await dashboard_service.top_students(db, limit)