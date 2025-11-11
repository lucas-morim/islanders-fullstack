from pydantic import BaseModel, Field
from typing import Optional

class AreaBase(BaseModel):
    name: str = Field(max_length=50)
    description: Optional[str] = None

class AreaCreate(AreaBase):
    pass

class AreaUpdate(BaseModel):
    name: Optional[str] = Field(default=None, max_length=50)
    description: Optional[str] = None

class AreaOut(AreaBase):
    id: str

    class Config:
        from_attributes = True