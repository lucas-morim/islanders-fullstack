from __future__ import annotations
from typing import TYPE_CHECKING
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import ForeignKey, Boolean
from app.db.session import Base

if TYPE_CHECKING:
    from app.models.question import Question
    from app.models.option import Option


class QuestionOption(Base):
    __tablename__ = "questions_options"

    question_id: Mapped[str] = mapped_column(ForeignKey("questions.id", ondelete="CASCADE"), primary_key=True, index=True)
    option_id: Mapped[str] = mapped_column(ForeignKey("options.id", ondelete="CASCADE"), primary_key=True, index=True)
    is_correct: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    question: Mapped[Question] = relationship(
        "Question", 
        back_populates="question_options",
        passive_deletes=True
    )
    option: Mapped[Option] = relationship(
        "Option", 
        back_populates="question_options", 
        passive_deletes=True
    )
