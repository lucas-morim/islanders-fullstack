from __future__ import annotations
from typing import TYPE_CHECKING
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, ForeignKey, Text
from app.db.base import Base
from app.models.common import IdMixin, TimestampMixin

if TYPE_CHECKING:
    from app.models.area import Area
    from app.models.project import Project
    from app.models.quiz import Quiz

class Course(IdMixin, TimestampMixin, Base):
    __tablename__ = "courses"
    name: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text(), nullable=True)
    area_id: Mapped[str | None] = mapped_column(ForeignKey("areas.id", ondelete="CASCADE"), index=True, nullable=True)

    area: Mapped[Area] = relationship(
        "Area", 
        back_populates="courses", 
        passive_deletes=True
    )

    projects: Mapped[list[Project]] = relationship(
        "Project", 
        back_populates="course", 
        cascade="all, delete-orphan",
        passive_deletes=True
    )

    quizzes: Mapped[list[Quiz]] = relationship(
        "Quiz", 
        back_populates="course", 
        cascade="all, delete-orphan",
        passive_deletes=True
    )