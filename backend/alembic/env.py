# Script principal de configuração do Alembic.
# Liga o Alembic à engine SQLAlchemy e ao metadata dos modelos.
# Garante que as migrações refletem o estado atual dos modelos.

from __future__ import annotations

from logging.config import fileConfig
from alembic import context
from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

# importa configurações do projeto
from backend.app.core.config import settings
from app.db import Base

# importa modelos (importante para autogenerate funcionar)
from app.models import user, role

config = context.config

# define URL do banco com base no .env
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)

# configuração de logging do Alembic
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Executa migrations em modo offline (gera SQL sem conectar no banco)."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        compare_type=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection) -> None:
    """Executa migrations em modo online (conectado no banco)."""
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        compare_type=True,
    )

    with context.begin_transaction():
        context.run_migrations()


async def run_migrations_online() -> None:
    """Cria engine async e executa migrations."""
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)
    await connectable.dispose()


if context.is_offline_mode():
    run_migrations_offline()
else:
    import asyncio

    asyncio.run(run_migrations_online())
