from pydantic import BaseModel
from typing import List


class QuestionOptionBase(BaseModel):
    question_id: str
    option_id: str
    is_correct: bool = False

    class Config:
        from_attributes = True


class QuestionOptionCreate(QuestionOptionBase):
    pass


class QuestionOptionUpdate(BaseModel):
    is_correct: bool

    class Config:
        from_attributes = True


class QuestionOptionOut(QuestionOptionBase):
    pass


class QuestionOptionsSync(BaseModel):
    option_ids: List[str]
    correct_option_id: str
