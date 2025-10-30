# Configuração da engine do SQLAlchemy (async) e sessão de base de dados.
# - Cria a engine com base no DATABASE_URL
# - Cria o sessionmaker (AsyncSessionLocal)
# - Define o get_session() usado como dependência (injeção no FastAPI)

from app.core.config import settings
from collections.abc import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

class Base(DeclarativeBase):
    pass

engine = create_async_engine(
    settings.DATABASE_URL,
    echo = False,
    future = True,
    pool_pre_ping = True,
)

AsyncSessionLocal = sessionmaker(
    bind = engine,
    class_ = AsyncSession,
    expire_on_commit = False,
)

async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session