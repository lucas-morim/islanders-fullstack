from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.auth_register import UserRegister
from app.schemas.auth_login import TokenOut
from app.services.user_service import service as user_service
from app.core.security import create_access_token
from app.schemas.user import UserCreate

GUEST_ROLE_ID = "9eae7111-ba1e-4d1d-96a7-6ddba05f600d"

class AuthRegisterService:
    def __init__(self):
        self.user_service = user_service

    async def register_guest(self, db: AsyncSession, payload: UserRegister) -> TokenOut:
        # Criar usuário com valores default para guest
        data = UserCreate(
            **payload.dict(),
            role_id=GUEST_ROLE_ID,
            status="active",
            photo=None
        )

        user = await self.user_service.create(db, payload=data)

        # Criar token JWT
        access_token = create_access_token(
            subject=str(user.id),
            role_id=user.role_id
        )

        return TokenOut(access_token=access_token)

auth_register_service = AuthRegisterService()