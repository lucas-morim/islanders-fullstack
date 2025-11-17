from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.core.deps import get_db
from app.schemas.user import UserCreate, UserUpdate, UserOut
from app.services.user_service import service as user_service

router = APIRouter()

@router.get("/", response_model=List[UserOut])
async def list_users(
    db: AsyncSession = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
):
    return await user_service.list(db, skip=skip, limit=limit)

@router.get("/{user_id}", response_model=UserOut)
async def get_user(
    user_id: str,
    db: AsyncSession = Depends(get_db),
):
    return await user_service.get(db, user_id)

@router.post("/", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def create_user(
    payload: UserCreate,
    db: AsyncSession = Depends(get_db),
):
    return await user_service.create(db, payload)

@router.put("/{user_id}", response_model=UserOut)
async def update_user(
    user_id: str,
    payload: UserUpdate,
    db: AsyncSession = Depends(get_db),
):
    return await user_service.update(
        db,
        user_id,
        name=payload.name,
        email=payload.email,
        password=payload.password,
        role_id=payload.role_id,
        username=payload.username,
        photo=payload.photo,
        status=payload.status,
    )

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: str,
    db: AsyncSession = Depends(get_db),
):
    await user_service.delete(db, user_id)
    return None
