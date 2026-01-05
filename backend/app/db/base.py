from app.db.session import Base

# Registre os modelos para o Alembic enxergar
from app.models.user import User      
from app.models.role import Role      
from app.models.course import Course  
from app.models.area import Area
from app.models.area_course import AreaCourse
from app.models.quiz import Quiz
from app.models.project import Project
from app.models.quiz_attempt import QuizAttempt
from app.models.question import Question
from app.models.question_option import QuestionOption
from app.models.option import Option
from app.models.answer import Answer
from app.models.modality import Modality
from app.models.video import Video
from app.models.badges import Badge
from app.models.quiz_badge_award import QuizBadgeAward