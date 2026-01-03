from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from datetime import datetime

from app.core.deps import get_db
from app.schemas.user import UserCreate, UserUpdate, UserOut, StatusEnum
from app.services.user_service import service as user_service
from app.utils.csv_export import stream_csv

router = APIRouter()

@router.get("/", response_model=List[UserOut])
async def list_users(
    db: AsyncSession = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: Optional[int] = Query(None, ge=1),
):
    return await user_service.list(db, skip=skip, limit=limit)

@router.get("/export/csv")
async def export_users_csv(
    db: AsyncSession = Depends(get_db),
    q: Optional[str] = Query(None),
    role_id: Optional[str] = Query(None),
    status: Optional[StatusEnum] = Query(None),
):
    users = await user_service.export(db, q=q, role_id=role_id, status=status)

    filename = f"users_{datetime.utcnow().strftime('%Y-%m-%d_%H-%M')}.csv"
    header = ["ID", "Nome", "Username", "Email", "Função", "Status", "Criado em"]

    return stream_csv(
        filename,
        header,
        users,
        lambda u: [
            u.id,
            u.name,
            u.username,
            u.email,
            (u.role.name if u.role else "Guest"),
            u.status,
            u.created_at.isoformat() if u.created_at else "",
        ],
    )

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
