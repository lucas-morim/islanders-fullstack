from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from app.core.deps import get_db
from app.schemas.course import CourseCreate, CourseUpdate, CourseOut
from app.services.course_service import service as course_service

from datetime import datetime
from app.schemas.course import StatusEnum
from app.utils.csv_export import stream_csv

router = APIRouter()

@router.get("/export/csv")
async def export_courses_csv(
    db: AsyncSession = Depends(get_db),
    q: Optional[str] = Query(None),
    area_id: Optional[str] = Query(None),
    modality_id: Optional[str] = Query(None),
    status: Optional[StatusEnum] = Query(None),
):
    courses = await course_service.export(
        db, q=q, area_id=area_id, modality_id=modality_id, status=status
    )

    filename = f"courses_{datetime.utcnow().strftime('%Y-%m-%d_%H-%M')}.csv"
    header = [
        "ID", "Título", "Descrição", "Áreas", "Modalidade", "Status",
        "Horas", "Créditos", "Preço", "Criado em"
    ]

    return stream_csv(
        filename,
        header,
        courses,
        lambda c: [
            c.id,
            c.title,
            c.description or "",
            ", ".join([a.name for a in (c.areas or [])]) if getattr(c, "areas", None) else "",
            c.modality.name if c.modality else "",
            c.status,
            c.num_hours or "",
            c.credits or "",
            c.price or "",
            c.created_at.isoformat() if c.created_at else "",
        ],
    )

@router.get("/", response_model=List[CourseOut])
async def list_courses(
    db: AsyncSession = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: Optional[int] = Query(None, ge=1)
):
    return await course_service.list(db, skip=skip, limit=limit)


@router.get("/{course_id}", response_model=CourseOut)
async def get_course(
    course_id: str,
    db: AsyncSession = Depends(get_db),
):
    return await course_service.get(db, course_id)


@router.post("/", response_model=CourseOut, status_code=status.HTTP_201_CREATED)
async def create_course(
    payload: CourseCreate,
    db: AsyncSession = Depends(get_db),
):
    return await course_service.create(
        db=db,
        obj_in=payload,
    )


@router.put("/{course_id}", response_model=CourseOut)
async def update_course(
    course_id: str,
    payload: CourseUpdate,
    db: AsyncSession = Depends(get_db),
):
    return await course_service.update(
        db=db,
        course_id=course_id,
        obj_in=payload,
    )


@router.delete("/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_course(
    course_id: str,
    db: AsyncSession = Depends(get_db),
):
    await course_service.delete(db, course_id)
    return None
