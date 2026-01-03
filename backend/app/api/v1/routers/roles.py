from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from app.core.deps import get_db
from app.schemas.role import RoleCreate, RoleUpdate, RoleOut
from app.services.role_service import service as role_service

router = APIRouter()

@router.get("/", response_model=List[RoleOut])
async def list_roles(
    db: AsyncSession = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: Optional[int] = Query(None, ge=1),
):
    return await role_service.list(db, skip=skip, limit=limit)


@router.get("/{role_id}", response_model=RoleOut)
async def get_role(
    role_id: str,
    db: AsyncSession = Depends(get_db),
):
    return await role_service.get(db, role_id)


@router.post("/", response_model=RoleOut, status_code=status.HTTP_201_CREATED)
async def create_role(
    payload: RoleCreate,
    db: AsyncSession = Depends(get_db),
):
    return await role_service.create(
        db,
        name=payload.name,
        description=payload.description
    )


@router.put("/{role_id}", response_model=RoleOut)
async def update_role(
    role_id: str,
    payload: RoleUpdate,
    db: AsyncSession = Depends(get_db),
):
    return await role_service.update(
        db,
        role_id,
        name=payload.name,
        description=payload.description
    )


@router.delete("/{role_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_role(
    role_id: str,
    db: AsyncSession = Depends(get_db),
):
    await role_service.delete(db, role_id)
    return None
