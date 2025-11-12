from pydantic import BaseModel, Field
from typing import Optional

class RoleBase(BaseModel):
    name: str = Field(max_length=60)
    description: Optional[str] = Field(default=None, max_length=500)

    class Config:
        from_attributes = True

class RoleCreate(RoleBase):
    pass  

class RoleUpdate(BaseModel):
    name: Optional[str] = Field(default=None, max_length=60)
    description: Optional[str] = Field(default=None, max_length=500)

class RoleOut(RoleBase):
    id: str

    class Config:
        from_attributes = True
