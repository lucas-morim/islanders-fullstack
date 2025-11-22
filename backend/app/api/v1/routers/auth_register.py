from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.auth_register import UserRegister
from app.schemas.auth_login import TokenOut
from app.services.auth_register_service import auth_register_service
from app.core.deps import get_db

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register", response_model=TokenOut, status_code=status.HTTP_201_CREATED)
async def register(payload: UserRegister, db: AsyncSession = Depends(get_db)):
    return await auth_register_service.register_guest(db, payload)