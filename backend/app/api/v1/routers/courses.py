from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.core.deps import get_db
from app.schemas.course import CourseCreate, CourseUpdate, CourseOut
from app.services.course_service import service as course_service

router = APIRouter()

@router.get("/", response_model=List[CourseOut])
async def list_courses(
    db: AsyncSession = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
):
    return await course_service.list(db, skip=skip, limit=limit)

@router.get("/{course_id}", response_model=CourseOut)
async def get_course(
    course_id: str,
    db: AsyncSession = Depends(get_db)
):
    return await course_service.get(db, course_id)

@router.post("/", response_model=CourseOut, status_code=status.HTTP_201_CREATED)
async def create_course(
    payload: CourseCreate,
    db: AsyncSession = Depends(get_db)
):
    return await course_service.create(
        db,
        title=payload.title,
        description=payload.description,
        area_ids=payload.area_ids
    )

@router.put("/{course_id}", response_model=CourseOut)
async def update_course(
    course_id: str,
    payload: CourseUpdate,
    db: AsyncSession = Depends(get_db)
):
    return await course_service.update(
        db,
        course_id,
        title=payload.title,
        description=payload.description,
        area_ids=payload.area_ids
    )

@router.delete("/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_course(
    course_id: str,
    db: AsyncSession = Depends(get_db)
):
    await course_service.delete(db, course_id)
    return None
