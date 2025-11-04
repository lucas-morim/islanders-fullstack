from __future__ import annotations
from typing import TYPE_CHECKING
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Text
from app.db.base import Base
from app.models.common import IdMixin, TimestampMixin

if TYPE_CHECKING:
    from app.models.user import User

class Role(IdMixin, TimestampMixin, Base):
    __tablename__ = "roles"
    name: Mapped[str] = mapped_column(String(60), unique=True, index=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text(), nullable=True)

    users: Mapped[list[User]] = relationship(
        "User", 
        back_populates="role", 
        passive_deletes=True
    )