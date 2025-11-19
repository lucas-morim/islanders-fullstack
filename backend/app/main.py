# Ponto de entrada da aplicação FastAPI.
# Aqui é onde a aplicação é criada (app = FastAPI()).
# - Inclui routers (rotas da API)
# - Configura middlewares (CORS, autenticação, etc.)
# - Define eventos de startup/shutdown
# - Pode incluir documentação Swagger personalizada

from app.core.config import settings
from app.api.v1 import api_router
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db import base 

app = FastAPI(title="Islanders University API", version="0.1.0")

# Configuração temporária de CORS (vamos aprimorar depois)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # depois trocamos para o frontend Angular
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclui todos os routers da API
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": "Welcome to Islanders University API"}