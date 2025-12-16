from pydantic import BaseModel
from typing import List, Optional
from app.schemas.quiz import QuizOut

class OptionMini(BaseModel):
    id: str
    text: str
    class Config:
        from_attributes = True

class QuestionFull(BaseModel):
    id: str
    text: str
    options: List[OptionMini]
    class Config:
        from_attributes = True

class QuizFullOut(BaseModel):
    quiz: QuizOut
    questions: List[QuestionFull]
