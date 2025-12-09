from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import datetime
import enum


class StatusEnum(str, enum.Enum):
    active = "active"
    inactive = "inactive"


class CourseBase(BaseModel):
    title: str = Field(..., max_length=50)
    description: Optional[str] = None
    content: Optional[str] = None
    target: Optional[str] = None
    start_info: Optional[str] = None
    area_ids: Optional[List[str]] = None
    status: StatusEnum = StatusEnum.active
    num_hours: Optional[int] = Field(None, ge=0)
    credits: Optional[int] = Field(None, ge=0)
    price: Optional[float] = Field(None, ge=0)
    photo: Optional[str] = Field(default=None, max_length=255)

    class Config:
        from_attributes = True


class CourseCreate(CourseBase):
    modality_id: Optional[str] = None
    pass


class CourseUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=50)
    description: Optional[str] = None
    area_ids: Optional[List[str]] = None
    modality_id: Optional[str] = None
    num_hours: Optional[int] = Field(None, ge=0)
    credits: Optional[int] = Field(None, ge=0)
    price: Optional[float] = Field(None, ge=0)
    photo: Optional[str] = Field(None, max_length=255)
    status: Optional[StatusEnum] = None

    class Config:
        from_attributes = True


class CourseOut(CourseBase):
    id: str
    modality_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
