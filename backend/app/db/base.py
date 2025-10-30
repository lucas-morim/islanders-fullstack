# Ponto de importação central dos modelos SQLAlchemy.
# Exemplo:
# from app.models.user import User
# from app.models.course import Course

from app.db.session import Base
from app.models import user, course  # importa todos os modelos

# Isto serve para o Alembic detectar os modelos ao gerar migrações
