# Define dependências reutilizáveis do FastAPI.
# - get_db(): injeta sessão de BD em endpoints
# - get_current_user(): valida JWT e retorna utilizador autenticado
# - Funções auxiliares para autorização

from typing import Annotated
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db import get_session

SessionDep = Annotated[AsyncSession, Depends(get_session)]
