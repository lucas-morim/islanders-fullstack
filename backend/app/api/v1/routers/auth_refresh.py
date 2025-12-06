from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from app.core.security import decode_token, create_access_token, create_refresh_token
from app.core.deps import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.crud.user_repo import UserRepository
from sqlalchemy import select
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Auth"])

class RefreshIn(BaseModel):
    refresh_token: str

class TokenOutRefresh(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


@router.post("/refresh", response_model=TokenOutRefresh)
async def refresh_token(payload: RefreshIn, db: AsyncSession = Depends(get_db)):
    token = payload.refresh_token
    payload_data = decode_token(token)
    if payload_data is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    if payload_data.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type")

    user_id = payload_data.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token payload")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    if getattr(user, "status", None) != "active":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Inactive user")

    # cria novos tokens
    access_token = create_access_token(subject=str(user.id), role_id=user.role_id)
    new_refresh = create_refresh_token(subject=str(user.id))
    return TokenOutRefresh(access_token=access_token, refresh_token=new_refresh)