# Este módulo será responsável pela segurança e autenticação do sistema ISLANDERS.
# Aqui vão funções de:
#  - Hashing de senhas (bcrypt)
#  - Criação e validação de tokens JWT
#  - Verificação de utilizador autenticado (via dependências)
#
# Exemplo (a implementar futuramente):
# def hash_password(password: str): ...
# def verify_password(plain, hashed): ...
# def create_access_token(data): ...
# def verify_token(token): ...


#exemplo explicativo (APENAS UM EXEMPLO):

from datetime import datetime, timedelta
from jose import jwt, JWTError
from passlib.context import CryptContext
from app.core.config import settings

# Configuração de hashing (usada para guardar senhas com segurança)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Chave secreta usada para assinar os tokens JWT
SECRET_KEY = "super_secret_key_change_me"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60


# Funções de hashing e verificação de senha ------------------------------

def hash_password(password: str) -> str:
    """Recebe uma senha e devolve uma versão hash (segura)"""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica se a senha fornecida pelo utilizador corresponde ao hash guardado"""
    return pwd_context.verify(plain_password, hashed_password)


# Funções relacionadas com JWT -------------------------------------------

def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    """
    Gera um token JWT com dados do utilizador (ex: id, email).
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_token(token: str) -> dict | None:
    """
    Verifica se o token JWT é válido e devolve o payload (dados).
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None
