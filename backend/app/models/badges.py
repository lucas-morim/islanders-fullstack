from __future__ import annotations
from typing import TYPE_CHECKING

from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Integer

from app.db.session import Base
from app.models.common import IdMixin, TimestampMixin

if TYPE_CHECKING:
    from app.models.quiz_badge_award import QuizBadgeAward


class Badge(IdMixin, TimestampMixin, Base):
    __tablename__ = "badges"
    code: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(50), nullable=False)
    min_score: Mapped[int] = mapped_column(Integer, nullable=False)
    image: Mapped[str | None] = mapped_column(String(255), nullable=True)

    awards: Mapped[list[QuizBadgeAward]] = relationship(
        "QuizBadgeAward",
        back_populates="badge",
        passive_deletes=True,
    )