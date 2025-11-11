from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import datetime


class QuestionBase(BaseModel):
    text: str = Field(..., max_length=500)
    quiz_id: str
    option_ids: Optional[List[str]] = None  # opções associadas à pergunta

    class Config:
        from_attributes = True


class QuestionCreate(QuestionBase):
    pass

class QuestionUpdate(BaseModel):
    text: Optional[str] = Field(None, max_length=500)
    quiz_id: Optional[str] = None
    option_ids: Optional[List[str]] = None

    class Config:
        from_attributes = True

class QuestionOut(QuestionBase):
    id: str
    created_at: datetime
    updated_at: datetime
