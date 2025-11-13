from typing import Sequence, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from app.models.user import User
from app.schemas.user import UserCreate, StatusEnum  # ajuste o import se seu StatusEnum estiver em outro módulo


class UserRepository:
    async def list(self, db: AsyncSession, skip: int = 0, limit: int = 100) -> Sequence[User]:
        result = await db.execute(
            select(User)
            .offset(skip)
            .limit(limit)
            .order_by(User.created_at.desc())  # se usar TimestampMixin
        )
        return result.scalars().all()

    async def get(self, db: AsyncSession, user_id: str) -> Optional[User]:
        return await db.get(User, user_id)

    async def get_by_email(self, db: AsyncSession, email: str) -> Optional[User]:
        result = await db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()

    async def get_by_username(self, db: AsyncSession, username: str) -> Optional[User]:
        result = await db.execute(select(User).where(User.username == username))
        return result.scalar_one_or_none()

    def _status_value(self, status: Optional[StatusEnum | str]) -> Optional[str]:
        if status is None:
            return None
        return status.value if isinstance(status, StatusEnum) else status

    async def create(self, db: AsyncSession, payload: UserCreate) -> User:
        username = payload.username.strip().lower()

        user = User(
            name=payload.name,
            email=payload.email,
            username=username,
            password=payload.password,   
            role_id=payload.role_id,
            photo=payload.photo if hasattr(payload, "photo") else None,
            status=self._status_value(getattr(payload, "status", StatusEnum.active)) or "active",
        )
        db.add(user)
        try:
            await db.commit()
        except IntegrityError:
            await db.rollback()
            raise
        await db.refresh(user)
        return user

    async def update(
        self,
        db: AsyncSession,
        user: Optional[User],
        *,
        name: Optional[str] = None,
        email: Optional[str] = None,
        password: Optional[str] = None,
        role_id: Optional[str] = None,
        username: Optional[str] = None,
        photo: Optional[str] = None,
        status: Optional[StatusEnum | str] = None,
    ) -> Optional[User]:
        if not user:
            return None

        if name is not None:
            user.name = name
        if email is not None:
            user.email = email
        if password is not None:
            user.password = password
        if role_id is not None:
            user.role_id = role_id
        if username is not None:
            user.username = username.strip().lower() 
        if photo is not None:
            user.photo = photo
        if status is not None:
            user.status = self._status_value(status)

        db.add(user)
        try:
            await db.commit()
        except IntegrityError:
            await db.rollback()
            raise
        await db.refresh(user)
        return user

    async def delete(self, db: AsyncSession, user: Optional[User]) -> bool:
        if not user:
            return False
        await db.delete(user)
        await db.commit()
        return True
