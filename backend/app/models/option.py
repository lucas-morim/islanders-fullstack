from __future__ import annotations
from typing import TYPE_CHECKING
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String
from app.db.base import Base
from app.models.common import IdMixin, TimestampMixin

if TYPE_CHECKING:
    from app.models.question_option import QuestionOption
    from app.models.answer import Answer

class Option(IdMixin, TimestampMixin, Base):
    __tablename__ = "options"
    text: Mapped[str | None] = mapped_column(String(255), nullable=False, unique=True)

    question_options: Mapped[list[QuestionOption]] = relationship(
        "QuestionOption", 
        back_populates="option", 
        cascade="all, delete-orphan",
        passive_deletes=True
    )

    answers: Mapped[list[Answer]] = relationship(
        "Answer", 
        back_populates="selected_option", 
        passive_deletes=True
    )