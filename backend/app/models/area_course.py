from __future__ import annotations
from typing import TYPE_CHECKING
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import ForeignKey
from app.db.session import Base

if TYPE_CHECKING:
    from app.models.area import Area
    from app.models.course import Course


class AreaCourse(Base):
    __tablename__ = "area_course"

    area_id: Mapped[str] = mapped_column(ForeignKey("areas.id", ondelete="CASCADE"), primary_key=True, index=True)
    course_id: Mapped[str] = mapped_column(ForeignKey("courses.id", ondelete="CASCADE"), primary_key=True, index=True)

    area: Mapped[Area] = relationship(
        "Area",
        back_populates="area_courses",
        passive_deletes=True
        #overlaps="areas,courses"
        )
    
    course: Mapped[Course] = relationship(
        "Course",
        back_populates="area_courses",
        passive_deletes=True
        #overlaps="areas,courses"
        )   