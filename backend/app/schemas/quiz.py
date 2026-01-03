import enum
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class StatusEnum(str, enum.Enum):
    active = "active"
    inactive = "inactive"

class QuizBase(BaseModel):
    title: str = Field(..., max_length=200, example="Quiz sobre ...")
    description: Optional[str] = Field(None, example="Descrição")
    status: StatusEnum = StatusEnum.active 

    class Config:
        from_attributes = True


class QuizCreate(QuizBase):
    user_id: Optional[str] = None  
    course_id: str
    video_id: Optional[str] = None

class QuizUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = None
    status: Optional[StatusEnum] = None
    course_id: Optional[str] = None
    video_id: Optional[str] = None

    class Config:
        from_attributes = True


class QuizOut(QuizBase):
    id: str
    user_id: Optional[str] = None
    course_id: str
    video_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True