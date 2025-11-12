from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class QuizAttemptBase(BaseModel):
    score: float = Field(..., ge=0, le=100, example=80)
    finished_at: Optional[datetime] = Field(None)

    class Config:
        from_attributes = True


class QuizAttemptCreate(QuizAttemptBase):
    user_id: str
    quiz_id: str


class QuizAttemptUpdate(BaseModel):
    score: Optional[float] = Field(None, ge=0, le=100)
    finished_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class QuizAttemptOut(QuizAttemptBase):
    id: str
    user_id: str
    quiz_id: str