from __future__ import annotations
from typing import TYPE_CHECKING
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, ForeignKey, Enum, Date
from app.db.session import Base
from app.models.common import IdMixin, TimestampMixin

if TYPE_CHECKING:
    from app.models.role import Role
    from app.models.project import Project
    from app.models.quiz import Quiz
    from app.models.quiz_attempt import QuizAttempt
    from app.models.quiz_badge_award import QuizBadgeAward


class User(IdMixin, TimestampMixin, Base):
    __tablename__ = "users"

    name: Mapped[str] = mapped_column(String(120), nullable=False)
    username: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[str] = mapped_column(Enum("active", "inactive", name="status_enum"), default="active", nullable=False)
    gender: Mapped[str | None] = mapped_column(Enum("male", "female", "other", name="gender_enum"), nullable=True)
    birthdate: Mapped[Date | None] = mapped_column(Date,nullable=True)

    photo: Mapped[str | None] = mapped_column(String(255), nullable=True)

    role_id: Mapped[str | None] = mapped_column(
        ForeignKey("roles.id", ondelete="SET NULL"),
        index=True,
        nullable=True
    )

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
        back_populates="user",
        cascade="all, delete-orphan",
        passive_deletes=True
    )

    quiz_attempts: Mapped[list[QuizAttempt]] = relationship(
        "QuizAttempt",
        back_populates="user",
        cascade="all, delete-orphan",
        passive_deletes=True
    )

    quiz_badge_awards: Mapped[list["QuizBadgeAward"]] = relationship(
        "QuizBadgeAward",
        back_populates="user",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
