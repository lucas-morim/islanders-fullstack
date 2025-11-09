from typing import Sequence, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import User
from app.schemas.user import UserCreate

class UserRepository:
    async def list(self, db: AsyncSession, skip: int = 0, limit: int = 100) -> Sequence[User]:
        result = await db.execute(select(User).offset(skip).limit(limit))
        return result.scalars().all()

    async def get(self, db: AsyncSession, user_id: str) -> Optional[User]:
        user = await db.get(User, user_id)
        return user

    async def get_by_email(self, db: AsyncSession, email: str) -> Optional[User]:
        result = await db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()

    async def create(self, db: AsyncSession, payload: UserCreate) -> User:
        user = User(
            name=payload.name,
            email=payload.email,
            password=payload.password,  # encripatado em services
            role_id=payload.role_id,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        return user

    async def update(self, db: AsyncSession, user: User, *, name: Optional[str] = None, email: Optional[str] = None, password: Optional[str] = None, role_id: Optional[str] = None) -> User:
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

        db.add(user)
        await db.commit()
        await db.refresh(user)
        return user


    async def delete(self, db: AsyncSession, user: User) -> bool:
        if not user:
            return None
    
        await db.delete(user)
        await db.commit()
        return True
