from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.security import OAuth2PasswordRequestForm
from app.core.deps import get_db
from app.services.auth_service import auth_service
from app.schemas.auth import UserLogin, TokenOut
from app.core.security import get_current_user

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/login", response_model=TokenOut, status_code=status.HTTP_200_OK)
async def login(payload: UserLogin, db: AsyncSession = Depends(get_db)):
    #login com user + pass e retorna o token jwt
    return await auth_service.login(db, payload)


@router.get("/me")
async def me(current_user=Depends(get_current_user)):
    #retorna as informações do user logado
    return current_user
