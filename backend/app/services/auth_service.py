from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from datetime import timedelta

from app.services.user_service import service as user_service
from app.schemas.auth import UserLogin, TokenOut
from app.core.security import create_access_token

class AuthService:
    def __init__(self):
        self.user_service = user_service

    async def login(self, db: AsyncSession, payload: UserLogin) -> TokenOut:
        # Normaliza username
        username = self.user_service._normalize_username(payload.username)
        user = await self.user_service.repo.get_by_username(db, username)

        if not user or not self.user_service.verify_password(payload.password, user.password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid username or password"
            )

        if getattr(user, "status", None) != "active":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Inactive user"
            )

        access_token = create_access_token(subject=str(user.id), role_id=user.role_id)
        return TokenOut(access_token=access_token)


    async def me(self, db: AsyncSession, user_id: str):
        user = await self.user_service.get(db, user_id)
        return user


auth_service = AuthService()