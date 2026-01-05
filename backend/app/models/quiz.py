
from __future__ import annotations
from typing import TYPE_CHECKING    
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, ForeignKey, Text, Enum, Index, text
from app.db.session import Base
from app.models.common import IdMixin, TimestampMixin

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.course import Course
    from app.models.question import Question
    from app.models.quiz_attempt import QuizAttempt
    from app.models.video import Video
    from app.models.quiz_badge_award import QuizBadgeAward

class Quiz(IdMixin, TimestampMixin, Base):
    __tablename__ = "quizzes"

    __table_args__ = (
        Index(
            "uq_quizzes_one_active_per_course",
            "course_id",
            unique=True,
            postgresql_where=text("status = 'active'"),
        ),
    )

    title: Mapped[str] = mapped_column(String(200), unique=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text(), nullable=True)
    user_id: Mapped[str | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), index=True, nullable=True)
    status: Mapped[str] = mapped_column(Enum("active", "inactive", name="status_enum"), default="active", nullable=False)
    course_id: Mapped[str] = mapped_column(ForeignKey("courses.id", ondelete="CASCADE"), index=True, nullable=False)
    video_id: Mapped[str | None] = mapped_column(ForeignKey("videos.id", ondelete="SET NULL"), index=True, nullable=True)

    user: Mapped[User | None] = relationship(
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

    video: Mapped[Video | None] = relationship(
        "Video", 
        back_populates="quizzes", 
        passive_deletes=True
    )

    quiz_badge_awards: Mapped[list["QuizBadgeAward"]] = relationship(
        "QuizBadgeAward",
        back_populates="quiz",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )