from pydantic import BaseModel
from typing import Optional
from app.schemas.quiz_attempt import QuizAttemptOut  # import do teu schema atual

class BadgeOut(BaseModel):
    id: str
    code: str
    name: str
    min_score: int
    image: Optional[str] = None

    class Config:
        from_attributes = True

class QuizAttemptFinishOut(BaseModel):
    attempt: QuizAttemptOut
    badge_awarded: Optional[BadgeOut] = None

    class Config:
        from_attributes = True
