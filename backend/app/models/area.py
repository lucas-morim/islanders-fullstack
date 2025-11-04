from __future__ import annotations
from typing import TYPE_CHECKING
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Text
from app.db.base import Base
from app.models.common import IdMixin, TimestampMixin

if TYPE_CHECKING:
    from app.models.course import Course

class Area(IdMixin, TimestampMixin, Base):
    __tablename__ = "areas"
    name: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text(), nullable=True)

    courses: Mapped[list[Course]] = relationship(
        "Course", 
        back_populates="area", 
        cascade="all, delete-orphan",
        passive_deletes=True
    )