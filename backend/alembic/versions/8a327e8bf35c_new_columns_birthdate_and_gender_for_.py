"""new columns birthdate and gender for user table

Revision ID: 8a327e8bf35c
Revises: aa4cdc2e076b
Create Date: 2026-01-04 23:48:59.326724
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "8a327e8bf35c"
down_revision: Union[str, Sequence[str], None] = "aa4cdc2e076b"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # 👉 cria o ENUM antes de usar
    gender_enum = sa.Enum("male", "female", "other", name="gender_enum")
    gender_enum.create(op.get_bind(), checkfirst=True)

    op.add_column(
        "users",
        sa.Column("gender", gender_enum, nullable=True)
    )

    op.add_column(
        "users",
        sa.Column("birthdate", sa.Date(), nullable=True)
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("users", "birthdate")
    op.drop_column("users", "gender")

    # 👉 remove o ENUM
    gender_enum = sa.Enum("male", "female", "other", name="gender_enum")
    gender_enum.drop(op.get_bind(), checkfirst=True)
