from __future__ import annotations
from typing import TYPE_CHECKING
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, ForeignKey, Text
from app.db.base import Base
from app.models.common import IdMixin, TimestampMixin

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.course import Course

class Project(IdMixin, TimestampMixin, Base):
    __tablename__ = "projects"
    title: Mapped[str] = mapped_column(String(150), nullable=False, unique=True)
    description: Mapped[str | None] = mapped_column(Text(), nullable=True)
    project_url: Mapped[str | None] = mapped_column(String(255), nullable=True)
    file_path: Mapped[str | None] = mapped_column(String(255), nullable=True)
    owner_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    course_id: Mapped[str] = mapped_column(ForeignKey("courses.id", ondelete="CASCADE"), index=True, nullable=False)

    owner: Mapped[User] = relationship(
        "User", 
        back_populates="projects", 
        passive_deletes=True
    )

    course: Mapped[Course] = relationship(
        "Course", 
        back_populates="projects", 
        passive_deletes=True
    )