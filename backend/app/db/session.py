# Configuração da engine do SQLAlchemy (async) e sessão de base de dados.
# - Cria a engine com base no DATABASE_URL
# - Cria o sessionmaker (AsyncSessionLocal)
# - Define o get_session() usado como dependência (injeção no FastAPI)

from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from app.core.config import settings

class Base(DeclarativeBase):
    pass

engine = create_async_engine(settings.DATABASE_URL, pool_pre_ping=True, future=True, echo=False)

async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
