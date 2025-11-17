from pydantic import BaseModel
from typing import Optional


class AnswerBase(BaseModel):
    attempt_id: str
    question_id: str
    option_id: Optional[str] = None

    class Config:
        from_attributes = True


class AnswerCreate(AnswerBase):
    pass


class AnswerUpdate(BaseModel):
    option_id: Optional[str] = None

    class Config:
        from_attributes = True


class AnswerOut(AnswerBase):
    id: str
