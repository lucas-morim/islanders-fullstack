from pydantic import BaseModel, Field


class UserRegister(BaseModel):
    name: str = Field(..., max_length=120)
    email: str = Field(..., max_length=255)
    username: str = Field(..., max_length=120)
    password: str = Field(..., min_length=6, max_length=255)