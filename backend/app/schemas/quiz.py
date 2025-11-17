from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class QuizBase(BaseModel):
    title: str = Field(..., max_length=200, example="Quiz sobre ...")
    description: Optional[str] = Field(None, example="Descrição")

    class Config:
        from_attributes = True


class QuizCreate(QuizBase):
    user_id: str
    course_id: str


class QuizUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = None
    course_id: Optional[str] = None

    class Config:
        from_attributes = True


class QuizOut(QuizBase):
    id: str
    user_id: str
    course_id: str
    created_at: datetime
    updated_at: datetime
