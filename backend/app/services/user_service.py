import re
from typing import Sequence, Optional
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from passlib.context import CryptContext

from app.repositories.crud.user_repo import UserRepository
from app.models.user import User
from app.schemas.user import UserCreate, StatusEnum

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")


class UserService:
    def __init__(self, repo: UserRepository = UserRepository()):
        self.repo = repo

    def _hash(self, password: str) -> str:
        return pwd_context.hash(password)

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        return pwd_context.verify(plain_password, hashed_password)

    def _normalize_username(self, username: str) -> str:
        s = username.strip().lower()
        s = re.sub(r"[^a-z0-9_]+", "_", s)
        s = s.strip("_")
        return s or "user"

    async def list(self, db: AsyncSession, skip: int = 0, limit: Optional[int] = None) -> Sequence[User]:
        return await self.repo.list(db, skip=skip, limit=limit)

    async def get(self, db: AsyncSession, user_id: str) -> User:
        user = await self.repo.get(db, user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        return user

    async def create(self, db: AsyncSession, payload: UserCreate) -> User:
        if await self.repo.get_by_email(db, payload.email):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

        username = self._normalize_username(payload.username)
        if await self.repo.get_by_username(db, username):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already registered")

        hashed_password = self._hash(payload.password)

        data = payload.dict() if hasattr(payload, "dict") else payload.model_dump()
        data.update(
            {
                "username": username,
                "password": hashed_password,
                "status": data.get("status") or StatusEnum.active,
            }
        )

        return await self.repo.create(db, UserCreate(**data))

    async def update(
        self,
        db: AsyncSession,
        user_id: str,
        *,
        name: Optional[str] = None,
        email: Optional[str] = None,
        password: Optional[str] = None,
        role_id: Optional[str] = None,
        username: Optional[str] = None,
        photo: Optional[str] = None,
        status: Optional[StatusEnum | str] = None,
    ) -> User:
        user = await self.get(db, user_id)

        if email and email != user.email:
            if await self.repo.get_by_email(db, email):
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

        new_username = None
        if username and username != user.username:
            username_normalized = self._normalize_username(username)
            existing = await self.repo.get_by_username(db, username_normalized)
            if existing:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already registered")
            new_username = username_normalized

        hashed = self._hash(password) if password is not None else None

        updated = await self.repo.update(
            db,
            user,
            name=name if name is not None else user.name,
            email=email if email is not None else user.email,
            password=hashed if hashed is not None else user.password,
            role_id=role_id if role_id is not None else user.role_id,
            username=new_username if new_username is not None else user.username,
            photo=photo if photo is not None else user.photo,
            status=status if status is not None else user.status,
        )
        return updated

    async def delete(self, db: AsyncSession, user_id: str) -> None:
        user = await self.get(db, user_id)
        await self.repo.delete(db, user)
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        return pwd_context.verify(plain_password, hashed_password)
    
    async def export(
        self,
        db: AsyncSession,
        *,
        q: Optional[str] = None,
        role_id: Optional[str] = None,
        status: Optional[StatusEnum | str] = None,
    ) -> Sequence[User]:
        return await self.repo.export(db, q=q, role_id=role_id, status=status)

service = UserService()
