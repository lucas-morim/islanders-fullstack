from pydantic import BaseModel, Field
from typing import Optional
import datetime as dt

class ModalityBase(BaseModel):
    name: str = Field(max_length=60)
    description: Optional[str] = Field(default=None, max_length=500)

    class Config:
        from_attributes = True

class ModalityCreate(ModalityBase):
    pass  

class ModalityUpdate(BaseModel):
    name: Optional[str] = Field(default=None, max_length=60)
    description: Optional[str] = Field(default=None, max_length=500)

class ModalityOut(ModalityBase):
    id: str
    created_at: dt.datetime
    updated_at: dt.datetime

    class Config:
        from_attributes = True