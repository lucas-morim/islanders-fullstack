from passlib.context import CryptContext
from typing import Sequence, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from app.repositories.crud.user_repo import UserRepository
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate

# configuração de hashing com argon2
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")


class UserService:
    def __init__(self):
        self.repo = UserRepository()

    async def list(self, db: AsyncSession, skip: int = 0, limit: int = 100) -> Sequence[User]:
        return await self.repo.list(db, skip=skip, limit=limit)

    async def get(self, db: AsyncSession, user_id: str) -> User:
        user = await self.repo.get(db, user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        return user

    async def create(self, db: AsyncSession, payload: UserCreate) -> User:
        existing_user = await self.repo.get_by_email(db, payload.email)
        if existing_user:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

        hashed_password = pwd_context.hash(payload.password)

        user = await self.repo.create(
            db,
            UserCreate(
                name=payload.name,
                email=payload.email,
                password=hashed_password,
                role_id=payload.role_id
            )
        )
        return user

    async def update(self,db: AsyncSession,user_id: str,*,name: Optional[str] = None,email: Optional[str] = None, password: Optional[str] = None,role_id: Optional[str] = None) -> User:
        user = await self.get(db, user_id)

        if email and email != user.email:
            existing_user = await self.repo.get_by_email(db, email)
            if existing_user:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

        if name is not None:
            user.name = name
        if email is not None:
            user.email = email
        if password is not None:
            user.password = pwd_context.hash(password)
        if role_id is not None:
            user.role_id = role_id

        user = await self.repo.update(
            db,
            user,
            name=user.name,
            email=user.email,
            password=user.password,
            role_id=user.role_id
        )
        return user

    async def delete(self, db: AsyncSession, user_id: str) -> None:
        user = await self.get(db, user_id)
        await self.repo.delete(db, user)


    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        return pwd_context.verify(plain_password, hashed_password)

    ### MÉTODO DE AUTENTICAÇÃO FUTURA (email+pass)
    # async def authenticate(self, db: AsyncSession, email: str, password: str) -> Optional[User]:
    #     user = await self.repo.get_by_email(db, email)
    #     if not user or not self.verify_password(password, user.password):
    #         return None
    #     return user


# Instância do serviço
service = UserService()
