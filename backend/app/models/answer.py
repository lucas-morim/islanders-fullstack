from __future__ import annotations
from typing import TYPE_CHECKING
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import ForeignKey
from app.db.session import Base
from app.models.common import IdMixin

if TYPE_CHECKING:
    from app.models.quiz_attempt import QuizAttempt
    from app.models.question import Question
    from app.models.option import Option

class Answer(IdMixin, Base):
    __tablename__ = "answers"
    attempt_id: Mapped[str] = mapped_column(ForeignKey("quiz_attempts.id", ondelete="CASCADE"), index=True, nullable=False)
    question_id: Mapped[str] = mapped_column(ForeignKey("questions.id", ondelete="CASCADE"), index=True, nullable=False)
    option_id: Mapped[str | None] = mapped_column(ForeignKey("options.id", ondelete="SET NULL"), index=True, nullable=True)

    attempt: Mapped[QuizAttempt] = relationship(
        "QuizAttempt", 
        back_populates="answers", 
        passive_deletes=True
    )

    question: Mapped[Question] = relationship(
        "Question", 
        back_populates="answers", 
        passive_deletes=True
    )

    option: Mapped[Option | None] = relationship(
        "Option", 
        back_populates="answers", 
        passive_deletes=True
    )