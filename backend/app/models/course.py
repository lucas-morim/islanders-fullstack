from __future__ import annotations
from typing import TYPE_CHECKING
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Text
from app.db.session import Base
from app.models.common import IdMixin, TimestampMixin

if TYPE_CHECKING:
    from app.models.area import Area
    from app.models.project import Project
    from app.models.quiz import Quiz
    from app.models.area_course import AreaCourse


class Course(IdMixin, TimestampMixin, Base):
    __tablename__ = "courses"

    title: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text(), nullable=True)

    # varias com varias
    area_courses: Mapped[list[AreaCourse]] = relationship(
        "AreaCourse",
        back_populates="course",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    areas: Mapped[list[Area]] = relationship(
        "Area",
        secondary="area_course",
        back_populates="courses",
        #overlaps="area_courses" (quando testar o uvicorn aparece uma imagem enorme a avisar que este campo está ligado a outros e com este comando em cada uma das models dá para silenciar esse texto)
        passive_deletes=True,
    )

    projects: Mapped[list[Project]] = relationship(
        "Project",
        back_populates="course",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    quizzes: Mapped[list[Quiz]] = relationship(
        "Quiz",
        back_populates="course",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
