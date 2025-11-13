from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "f241675eff31"
down_revision: Union[str, Sequence[str], None] = "1c551b140b61"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# defina o ENUM uma única vez
status_enum = sa.Enum("active", "inactive", name="status_enum")

def upgrade() -> None:
    """Upgrade schema."""
    bind = op.get_bind()

    # 1) Criar o tipo ENUM antes de usá-lo
    status_enum.create(bind, checkfirst=True)

    # 2) Adicionar colunas
    # username primeiro como NULLABLE para não quebrar linhas existentes
    op.add_column("users", sa.Column("username", sa.String(length=120), nullable=True))

    # status com server_default para preencher linhas existentes
    op.add_column(
        "users",
        sa.Column(
            "status",
            status_enum,
            nullable=False,
            server_default=sa.text("'active'")
        ),
    )

    # photo opcional
    op.add_column("users", sa.Column("photo", sa.String(length=255), nullable=True))

    # 3) Remover unique em 'name' (gerado pela sua revisão anterior)
    # (mantém como estava no autogen)
    op.drop_constraint(op.f("users_name_key"), "users", type_="unique")

    # 4) Backfill de 'username' a partir do e-mail (sanitiza e garante unicidade)
    # - base: parte antes do @, minúsculas, só [a-z0-9_], substitui outros por _
    # - resolve duplicatas acrescentando _<id>
    op.execute("""
        WITH base AS (
            SELECT
                id,
                LOWER(REGEXP_REPLACE(SPLIT_PART(email, '@', 1), '[^a-z0-9_]+', '_', 'g')) AS base_username
            FROM users
        ),
        first_pass AS (
            UPDATE users u
            SET username = b.base_username
            FROM base b
            WHERE u.id = b.id AND u.username IS NULL
            RETURNING u.id, u.username
        ),
        dups AS (
            SELECT u.id,
                   u.username,
                   ROW_NUMBER() OVER (PARTITION BY u.username ORDER BY u.id) AS rn
            FROM users u
            WHERE u.username IS NOT NULL
        )
        UPDATE users u
        SET username = CONCAT(u.username, '_', u.id)
        FROM dups d
        WHERE u.id = d.id AND d.rn > 1;
    """)

    # 5) Agora podemos tornar NOT NULL
    op.alter_column("users", "username", nullable=False)

    # 6) Criar UNIQUE nomeada em username
    op.create_unique_constraint("uq_users_username", "users", ["username"])

    # 7) Remover o server_default no banco (deixa o default só no modelo Python)
    op.alter_column("users", "status", server_default=None)


def downgrade() -> None:
    """Downgrade schema."""
    bind = op.get_bind()

    # 1) Remover UNIQUE de username
    op.drop_constraint("uq_users_username", "users", type_="unique")

    # 2) Recriar UNIQUE em name (como estava)
    op.create_unique_constraint(op.f("users_name_key"), "users", ["name"], postgresql_nulls_not_distinct=False)

    # 3) Remover colunas
    op.drop_column("users", "photo")
    op.drop_column("users", "status")
    op.drop_column("users", "username")

    # 4) Dropar o tipo ENUM (depois de remover todas as colunas que o usam)
    status_enum.drop(bind, checkfirst=True)
