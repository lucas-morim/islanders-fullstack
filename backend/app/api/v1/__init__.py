from fastapi import APIRouter
from app.api.v1.routers.areas import router as areas_router
from app.api.v1.routers.roles import router as roles_router
from app.api.v1.routers.users import router as users_router
from app.api.v1.routers.courses import router as courses_router
from app.api.v1.routers.options import router as options_router
from app.api.v1.routers.questions import router as questions_router
from app.api.v1.routers.quizzes import router as quizzes_router
from app.api.v1.routers.quiz_attempts import router as quiz_attempts_router
from app.api.v1.routers.answers import router as answers_router
from app.api.v1.routers.projects import router as projects_router
from app.api.v1.routers.modalities import router as modalities_router
from app.api.v1.routers.auth_login import router as auth_login_router
from app.api.v1.routers.auth_register import router as auth_register_router
from app.api.v1.routers.uploads import router as uploads_router
from app.api.v1.routers.auth_refresh import router as auth_refresh_router
from app.api.v1.routers.videos import router as videos_router
from app.api.v1.routers.question_option import router as question_option_router

api_router = APIRouter()

api_router.include_router(areas_router, prefix="/areas", tags=["Areas"])
api_router.include_router(roles_router, prefix="/roles", tags=["Roles"])
api_router.include_router(users_router, prefix="/users", tags=["Users"])
api_router.include_router(courses_router, prefix="/courses", tags=["Courses"])
api_router.include_router(videos_router, prefix="/videos", tags=["Videos"])
api_router.include_router(options_router, prefix="/options", tags=["Options"])
api_router.include_router(questions_router, prefix="/questions", tags=["Questions"])
api_router.include_router(question_option_router, prefix="/questions/{question_id}/options", tags=["Question Options"])
api_router.include_router(quizzes_router, prefix="/quizzes", tags=["Quizzes"])
api_router.include_router(quiz_attempts_router, prefix="/quiz_attempts", tags=["Quiz Attempts"])
api_router.include_router(answers_router, prefix="/answers", tags=["Answers"])
api_router.include_router(projects_router, prefix="/projects", tags=["Projects"])
api_router.include_router(modalities_router, prefix="/modalities", tags=["Modalities"])
api_router.include_router(auth_login_router, prefix="/auth", tags=["Auth"])
api_router.include_router(auth_register_router, prefix="/auth", tags=["Auth"])
api_router.include_router(uploads_router, prefix="/upload", tags=["Upload"])
api_router.include_router(auth_refresh_router, prefix="/auth", tags=["Auth"])