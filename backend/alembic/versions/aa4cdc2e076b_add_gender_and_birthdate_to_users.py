"""add gender and birthdate to users

Revision ID: aa4cdc2e076b
Revises: abe4fd15e434
Create Date: 2026-01-04 23:47:34.287807

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'aa4cdc2e076b'
down_revision: Union[str, Sequence[str], None] = 'abe4fd15e434'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
