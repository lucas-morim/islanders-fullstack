from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.core.deps import get_db
from app.schemas.option import OptionCreate, OptionOut, OptionUpdate
from app.services.option_service import service as option_service

router = APIRouter()


@router.get("/", response_model=List[OptionOut])
async def list_options(
    db: AsyncSession = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100)
):
    return await option_service.list(db, skip=skip, limit=limit)


@router.get("/{option_id}", response_model=OptionOut)
async def get_option(
    option_id: str,
    db: AsyncSession = Depends(get_db)
):
    return await option_service.get(db, option_id)


@router.post("/", response_model=OptionOut, status_code=status.HTTP_201_CREATED)
async def create_option(
    payload: OptionCreate,
    db: AsyncSession = Depends(get_db)
):
    return await option_service.create(db, text=payload.text)


@router.put("/{option_id}", response_model=OptionOut)
async def update_option(
    option_id: str,
    payload: OptionUpdate,
    db: AsyncSession = Depends(get_db)
):
    return await option_service.update(db, option_id, text=payload.text)


@router.delete("/{option_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_option(
    option_id: str,
    db: AsyncSession = Depends(get_db)
):
    await option_service.delete(db, option_id)
    return None