from pydantic import BaseModel, Field
from typing import Optional

class UserLogin(BaseModel):
    username: str = Field(..., max_length=120)
    password: str = Field(..., min_length=6, max_length=255)


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"