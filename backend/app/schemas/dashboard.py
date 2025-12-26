# app/schemas/dashboard.py
from pydantic import BaseModel
from typing import List, Optional

class SummaryOut(BaseModel):
    users: int
    courses: int
    quizzes: int

class AverageGradeOut(BaseModel):
    average: float

class LabelValue(BaseModel):
    label: str
    value: float

class GradeDistributionOut(BaseModel):
    range: str
    total: int