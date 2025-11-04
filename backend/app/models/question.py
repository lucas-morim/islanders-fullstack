from __future__ import annotations
from typing import TYPE_CHECKING
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Text, ForeignKey
from app.db.base import Base
from app.models.common import IdMixin, TimestampMixin

if TYPE_CHECKING:
    from app.models.quiz import Quiz
    from app.models.option import Option
    from app.models.question_option import QuestionOption
    from app.models.answer import Answer

class Question(IdMixin, TimestampMixin, Base):
    __tablename__ = "questions"
    text: Mapped[str] = mapped_column(Text(), nullable=False)
    quiz_id: Mapped[str] = mapped_column(ForeignKey("quizzes.id", ondelete="CASCADE"), index=True, nullable=False)

    quiz: Mapped[Quiz] = relationship(
        "Quiz", 
        back_populates="questions", 
        passive_deletes=True
    )

    question_options: Mapped[list[QuestionOption]] = relationship(
        "QuestionOption",
        back_populates="question", 
        cascade="all, delete-orphan",
        passive_deletes=True
    )

    # N:N “direto” com Option (apenas leitura, via tabela secondary). VALIDAR DEPOIS!!!
    options: Mapped[list[Option]] = relationship(
        "Option",
        secondary="questions_options",
        back_populates="questions",
        viewonly=True,  # manipule via QuestionOption
    )

    answers: Mapped[list[Answer]] = relationship(
        "Answer", 
        back_populates="question", 
        cascade="all, delete-orphan",
        passive_deletes=True
    )