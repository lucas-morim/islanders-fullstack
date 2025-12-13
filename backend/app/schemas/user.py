from __future__ import annotations
import enum
from typing import Optional
from pydantic import BaseModel, EmailStr, Field
import datetime as dt

class StatusEnum(str, enum.Enum):
    active = "active"
    inactive = "inactive"


class UserBase(BaseModel):
    name: str = Field(max_length=120)
    email: EmailStr = Field(max_length=255)
    username: str = Field(max_length=120)
    photo: Optional[str] = Field(default=None, max_length=255)
    status: StatusEnum = StatusEnum.active 

    class Config:
        from_attributes = True  
        from_attributes = True  



class UserCreate(UserBase):
    password: str = Field(min_length=6, max_length=255)
    role_id: Optional[str] = None



class UserUpdate(BaseModel):
    name: Optional[str] = Field(default=None, max_length=120)
    email: Optional[EmailStr] = Field(default=None, max_length=255)
    username: Optional[str] = Field(default=None, max_length=120)
    photo: Optional[str] = Field(default=None, max_length=255)
    status: Optional[StatusEnum] = None
    password: Optional[str] = Field(default=None, min_length=6, max_length=255)
    role_id: Optional[str] = None

    class Config:
        from_attributes = True


    class Config:
        from_attributes = True


class UserOut(UserBase):
    id: str
    role_id: Optional[str] = None
    created_at: dt.datetime
    updated_at: dt.datetime

    class Config:
        from_attributes = True