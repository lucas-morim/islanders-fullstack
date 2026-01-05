from __future__ import annotations
from typing import TYPE_CHECKING
import datetime as dt

from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import ForeignKey, DateTime, UniqueConstraint

from app.db.session import Base
from app.models.common import IdMixin, TimestampMixin

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.quiz import Quiz
    from app.models.badge import Badge
    from app.models.quiz_attempt import QuizAttempt


class QuizBadgeAward(IdMixin, TimestampMixin, Base):
    __tablename__ = "quiz_badge_awards"

    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )

    quiz_id: Mapped[str] = mapped_column(
        ForeignKey("quizzes.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )

    badge_id: Mapped[str] = mapped_column(
        ForeignKey("badges.id", ondelete="RESTRICT"),
        index=True,
        nullable=False,
    )

    attempt_id: Mapped[str | None] = mapped_column(
        ForeignKey("quiz_attempts.id", ondelete="SET NULL"),
        index=True,
        nullable=True,
    )

    awarded_at: Mapped[dt.datetime] = mapped_column(
        DateTime(timezone=True),
        default=dt.datetime.utcnow,
        nullable=False,
    )

    __table_args__ = (
        UniqueConstraint("user_id", "quiz_id", name="uq_badge_award_user_quiz"),
    )

    user: Mapped[User] = relationship(
        "User",
        back_populates="quiz_badge_awards",
        passive_deletes=True,
    )

    quiz: Mapped[Quiz] = relationship(
        "Quiz",
        back_populates="quiz_badge_awards",
        passive_deletes=True,
    )

    badge: Mapped[Badge] = relationship(
        "Badge",
        back_populates="awards",
        passive_deletes=True,
    )

    attempt: Mapped[QuizAttempt | None] = relationship(
        "QuizAttempt",
        back_populates="badge_award",
        passive_deletes=True,
    )
