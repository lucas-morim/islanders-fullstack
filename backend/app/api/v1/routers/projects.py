from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.core.deps import get_db
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectOut
from app.services.project_service import service as project_service

router = APIRouter()


@router.get("/", response_model=List[ProjectOut])
async def list_projects(
    db: AsyncSession = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100)
):
    return await project_service.list(db, skip=skip, limit=limit)


@router.get("/{project_id}", response_model=ProjectOut)
async def get_project(
    project_id: str,
    db: AsyncSession = Depends(get_db)
):
    return await project_service.get(db, project_id)


@router.post("/", response_model=ProjectOut, status_code=status.HTTP_201_CREATED)
async def create_project(
    payload: ProjectCreate,
    db: AsyncSession = Depends(get_db)
):
    return await project_service.create(
        db,
        title=payload.title,
        description=payload.description,
        project_url=payload.project_url,
        file_path=payload.file_path,
        user_id=payload.user_id,
        course_id=payload.course_id,
    )


@router.put("/{project_id}", response_model=ProjectOut)
async def update_project(
    project_id: str,
    payload: ProjectUpdate,
    db: AsyncSession = Depends(get_db)
):
    return await project_service.update(
        db,
        project_id,
        title=payload.title,
        description=payload.description,
        project_url=payload.project_url,
        file_path=payload.file_path,
        course_id=payload.course_id,
    )


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: str,
    db: AsyncSession = Depends(get_db)
):
    await project_service.delete(db, project_id)
    return None