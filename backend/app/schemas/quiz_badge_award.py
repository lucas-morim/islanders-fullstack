from __future__ import annotations
from typing import Optional
from pydantic import BaseModel
import datetime as dt


class QuizBadgeAwardBase(BaseModel):
    user_id: str
    quiz_id: str
    badge_id: str
    attempt_id: Optional[str] = None

    class Config:
        from_attributes = True


class QuizBadgeAwardCreate(QuizBadgeAwardBase):
    pass


class QuizBadgeAwardOut(QuizBadgeAwardBase):
    id: str
    awarded_at: dt.datetime
    created_at: dt.datetime
    updated_at: dt.datetime

    class Config:
        from_attributes = True
