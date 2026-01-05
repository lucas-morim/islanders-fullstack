from __future__ import annotations
from typing import TYPE_CHECKING
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import ForeignKey, DateTime
from app.db.session import Base
from app.models.common import IdMixin
import datetime as dt

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.quiz import Quiz
    from app.models.answer import Answer

class QuizAttempt(IdMixin, Base):
    __tablename__ = "quiz_attempts"
    score: Mapped[float] = mapped_column(nullable=False, default=0.0)
    finished_at: Mapped[dt.datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    quiz_id: Mapped[str] = mapped_column(ForeignKey("quizzes.id", ondelete="CASCADE"), index=True, nullable=False)

    user: Mapped[User] = relationship(
        "User", 
        back_populates="quiz_attempts", 
        passive_deletes=True
    )

    quiz: Mapped[Quiz] = relationship(
        "Quiz", 
        back_populates="quiz_attempts", 
        passive_deletes=True
    )

    answers: Mapped[list[Answer]] = relationship(
        "Answer", 
        back_populates="attempt", 
        cascade="all, delete-orphan",
        passive_deletes=True
    )