from __future__ import annotations
import enum
from typing import Optional
from pydantic import BaseModel, Field
import datetime as dt


class BadgeCode(str, enum.Enum):
    bronze = "bronze"
    silver = "silver"
    gold = "gold"


class BadgeBase(BaseModel):
    code: BadgeCode
    name: str = Field(max_length=50)
    min_score: int = Field(ge=0, le=100)
    image: Optional[str] = Field(default=None, max_length=255)

    class Config:
        from_attributes = True


class BadgeCreate(BadgeBase):
    pass


class BadgeUpdate(BaseModel):
    name: Optional[str] = Field(default=None, max_length=50)
    min_score: Optional[int] = Field(default=None, ge=0, le=100)
    image: Optional[str] = Field(default=None, max_length=255)

    class Config:
        from_attributes = True


class BadgeOut(BadgeBase):
    id: str
    created_at: dt.datetime
    updated_at: dt.datetime

    class Config:
        from_attributes = True
