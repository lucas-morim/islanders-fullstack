from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from app.core.deps import get_db
from app.schemas.area import AreaCreate, AreaOut, AreaUpdate
from app.services.area_service import service as area_service

router = APIRouter()

@router.get("/", response_model=List[AreaOut])
async def list_areas(
    db: AsyncSession = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: Optional[int] = Query(None, ge=1)
):
    return await area_service.list(
        db,
        skip=skip,
        limit=limit
    )

@router.get("/{area_id}", response_model=AreaOut)
async def get_area(
    area_id: str,
    db: AsyncSession = Depends(get_db)
):
    return await area_service.get(
        db,
        area_id
    )

@router.post("/", response_model=AreaOut, status_code=status.HTTP_201_CREATED)
async def create_area(
    payload: AreaCreate,
    db: AsyncSession = Depends(get_db)
):
    return await area_service.create(
        db,
        name=payload.name,
        description=payload.description
    )

@router.put("/{area_id}", response_model=AreaOut)
async def update_area(
    area_id: str,
    payload: AreaUpdate,
    db: AsyncSession = Depends(get_db)
):
    return await area_service.update(
        db,
        area_id,
        name=payload.name,
        description=payload.description
        )

@router.delete("/{area_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_area(
    area_id: str,
    db: AsyncSession = Depends(get_db)
):
    await area_service.delete(db, area_id)
    return None