from fastapi import APIRouter, Depends
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