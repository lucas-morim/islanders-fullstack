from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class UserBase(BaseModel):
    name: str = Field(max_length=120)
    email: EmailStr = Field(max_length=255)

    class Config:
        from_attributes = True

class UserCreate(UserBase):
    password: str = Field(min_length=6, max_length=255)
    role_id: Optional[str] = None

class UserUpdate(BaseModel):
    name: Optional[str] = Field(default=None, max_length=120)
    email: Optional[EmailStr] = Field(default=None, max_length=255)
    password: Optional[str] = Field(default=None, min_length=6, max_length=255)
    role_id: Optional[str] = None

class UserOut(UserBase):
    id: str
    role_id: Optional[str] = None

    class Config:
        from_attributes = True
