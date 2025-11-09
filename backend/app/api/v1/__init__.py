from fastapi import APIRouter
from app.api.v1.routers.areas import router as areas_router
# depois você vai importando mais:
from app.api.v1.routers.roles import router as roles_router
from app.api.v1.routers.users import router as users_router

api_router = APIRouter()
api_router.include_router(areas_router, prefix="/areas", tags=["Areas"])
api_router.include_router(roles_router, prefix="/roles", tags=["Roles"])
api_router.include_router(users_router, prefix="/users", tags=["Users"])
