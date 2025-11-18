from pydantic import BaseModel, Field
from typing import Optional
import datetime as dt

class AreaBase(BaseModel):
    name: str = Field(max_length=50)
    description: Optional[str] = Field(default=None, max_length=500)

class AreaCreate(AreaBase):
    pass

class AreaUpdate(BaseModel):
    name: Optional[str] = Field(default=None, max_length=50)
    description: Optional[str] = None

class AreaOut(AreaBase):
    id: str
    created_at: dt.datetime
    updated_at: dt.datetime

    class Config:
        from_attributes = True