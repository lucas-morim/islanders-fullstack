from app.db import base  # ← Add this FIRST, before creating the app
from app.core.config import settings
from app.api.v1 import api_router
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

app = FastAPI(title="Islanders University API", version="0.1.0")

origins = [
    "http://localhost:4200",  # Angular
    "http://127.0.0.1:4200",  # se precisares
    # "*"  # usar apenas em dev, não recomendado em produção
]

# Configuração temporária de CORS (vamos aprimorar depois)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs(settings.MEDIA_ROOT, exist_ok=True)
app.mount(settings.MEDIA_URL, StaticFiles(directory=settings.MEDIA_ROOT), name="media")

# Inclui todos os routers da API
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": "Welcome to Islanders University API"}