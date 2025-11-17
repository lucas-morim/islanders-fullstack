from pydantic import BaseModel, Field, HttpUrl
from typing import Optional
from datetime import datetime


class ProjectBase(BaseModel):
    title: str = Field(..., max_length=150, example="Islaverse")
    description: Optional[str] = Field(None, example="Projeto islaverse para islanders e e-teach-landers")
    project_url: Optional[HttpUrl] = Field(None, example="https://islaverse.com/islander")
    file_path: Optional[str] = Field(None, example="/uploads/projects/islaverse.zip")
    user_id: str
    course_id: str

    class Config:
        from_attributes = True


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=150)
    description: Optional[str] = None
    project_url: Optional[HttpUrl] = None
    file_path: Optional[str] = None
    course_id: Optional[str] = None

    class Config:
        from_attributes = True


class ProjectOut(ProjectBase):
    id: str
    created_at: datetime
    updated_at: datetime
