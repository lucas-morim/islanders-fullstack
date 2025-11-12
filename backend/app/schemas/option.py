from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class OptionBase(BaseModel):
    text: str = Field(..., max_length=255, example="Option A")

    class Config:
        from_attributes = True

class OptionCreate(OptionBase):
    pass

class OptionUpdate(BaseModel):
    text: Optional[str] = Field(None, max_length=255)

    class Config:
        from_attributes = True

class OptionOut(OptionBase):
    id: str
    created_at: datetime
    updated_at: datetime