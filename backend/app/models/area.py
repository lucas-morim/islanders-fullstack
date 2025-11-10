from __future__ import annotations
from typing import TYPE_CHECKING
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Text
from app.db.session import Base
from app.models.common import IdMixin, TimestampMixin

if TYPE_CHECKING:
    from app.models.course import Course
    from app.models.area_course import AreaCourse


class Area(IdMixin, TimestampMixin, Base):
    __tablename__ = "areas"

    name: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text(), nullable=True)

    area_courses: Mapped[list[AreaCourse]] = relationship(
        "AreaCourse",
        back_populates="area",
        #overlaps="area_courses" (quando testar o uvicorn aparece uma imagem enorme a avisar que este campo está ligado a outros e com este comando em cada uma das models dá para silenciar esse texto)
        cascade="all, delete-orphan",
        passive_deletes=True
    )

    courses: Mapped[list[Course]] = relationship(
        "Course",
        secondary="area_course",
        back_populates="areas"
    )
