from __future__ import annotations
from typing import TYPE_CHECKING    
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, ForeignKey, Text
from app.db.session import Base
from app.models.common import IdMixin, TimestampMixin

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.course import Course
    from app.models.question import Question
    from app.models.quiz_attempt import QuizAttempt

class Quiz(IdMixin, TimestampMixin, Base):
    __tablename__ = "quizzes"
    title: Mapped[str] = mapped_column(String(200), unique=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text(), nullable=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    course_id: Mapped[str] = mapped_column(ForeignKey("courses.id", ondelete="CASCADE"), index=True, nullable=False)

    user: Mapped[User] = relationship(
        "User", 
        back_populates="quizzes", 
        passive_deletes=True
    )

    course: Mapped[Course] = relationship(
        "Course", 
        back_populates="quizzes", 
        passive_deletes=True
    )

    questions: Mapped[list[Question]] = relationship(
        "Question", 
        back_populates="quiz", 
        cascade="all, delete-orphan",
        passive_deletes=True
    )

    quiz_attempts: Mapped[list[QuizAttempt]] = relationship(
        "QuizAttempt", 
        back_populates="quiz", 
        cascade="all, delete-orphan",
        passive_deletes=True
    )