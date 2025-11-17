from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import datetime

class CourseBase(BaseModel):
    title: str = Field(..., max_length=50)
    description: Optional[str] = None
    area_ids: Optional[List[str]] = None  # agora aceita vários ids de Areas

    class Config:
        from_attributes = True

class CourseCreate(CourseBase):
    pass

class CourseUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=50)
    description: Optional[str] = None
    area_ids: Optional[List[str]] = None

    class Config:
        from_attributes = True

class CourseOut(CourseBase):
    id: str
    created_at: datetime
    updated_at: datetime
