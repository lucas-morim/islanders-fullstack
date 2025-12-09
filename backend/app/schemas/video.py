from pydantic import BaseModel, Field, HttpUrl
from typing import Optional
import datetime as dt


class VideoBase(BaseModel):
    title: str = Field(max_length=50)
    description: Optional[str] = None
    video_url: str  # Talvez colocar HttpUrl

    class Config:
        from_attributes = True


class VideoCreate(VideoBase):
    pass


class VideoUpdate(BaseModel):
    title: Optional[str] = Field(default=None, max_length=50)
    description: Optional[str] = None
    video_url: Optional[str] = None


class VideoOut(VideoBase):
    id: str
    created_at: dt.datetime
    updated_at: dt.datetime

    class Config:
        from_attributes = True
