from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from app.core.deps import get_db
from app.schemas.modality import ModalityCreate, ModalityUpdate, ModalityOut
from app.services.modality_service import service as modality_service

router = APIRouter()

@router.get("/", response_model=List[ModalityOut])
async def list_modalitys(
    db: AsyncSession = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: Optional[int] = Query(None, ge=1),
):
    return await modality_service.list(db, skip=skip, limit=limit)


@router.get("/{modality_id}", response_model=ModalityOut)
async def get_modality(
    modality_id: str,
    db: AsyncSession = Depends(get_db),
):
    return await modality_service.get(db, modality_id)


@router.post("/", response_model=ModalityOut, status_code=status.HTTP_201_CREATED)
async def create_modality(
    payload: ModalityCreate,
    db: AsyncSession = Depends(get_db),
):
    return await modality_service.create(
        db,
        name=payload.name,
        description=payload.description
    )


@router.put("/{modality_id}", response_model=ModalityOut)
async def update_modality(
    modality_id: str,
    payload: ModalityUpdate,
    db: AsyncSession = Depends(get_db),
):
    return await modality_service.update(
        db,
        modality_id,
        name=payload.name,
        description=payload.description
    )


@router.delete("/{modality_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_modality(
    modality_id: str,
    db: AsyncSession = Depends(get_db),
):
    await modality_service.delete(db, modality_id)
    return None
