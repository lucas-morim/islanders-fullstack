from __future__ import annotations
from typing import TYPE_CHECKING
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, ForeignKey
from app.db.base import Base
from app.models.common import IdMixin, TimestampMixin

if TYPE_CHECKING:
    from app.models.role import Role
    from app.models.project import Project
    from app.models.quiz import Quiz

class User(IdMixin, TimestampMixin, Base):
    __tablename__ = "users"
    name: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password: Mapped[str] = mapped_column(String(255), nullable=False)
    role_id: Mapped[str] = mapped_column(ForeignKey("roles.id", ondelete="SET NULL"), index=True, nullable=True)

    role: Mapped[Role | None] = relationship(
        "Role", 
        back_populates="users", 
        passive_deletes=True
    )

    projects: Mapped[list[Project]] = relationship(
        "Project", 
        back_populates="user", 
        cascade="all, delete-orphan",
        passive_deletes=True
    )

    quizzes: Mapped[list[Quiz]] = relationship(
        "Quiz", 
        back_populates="creator", 
        cascade="all, delete-orphan",
        passive_deletes=True
    )