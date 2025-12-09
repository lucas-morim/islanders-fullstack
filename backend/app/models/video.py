from __future__ import annotations
from typing import TYPE_CHECKING
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Text
from app.db.session import Base
from app.models.common import IdMixin, TimestampMixin

if TYPE_CHECKING:
    from app.models.quiz import Quiz


class Video(IdMixin, TimestampMixin, Base):
    __tablename__ = "videos"

    title: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text(), nullable=True)
    video_url: Mapped[str] = mapped_column(Text(), nullable=False)

    quizzes: Mapped[list[Quiz]] = relationship(
        "Quiz", 
        back_populates="video", 
        passive_deletes=True
    )