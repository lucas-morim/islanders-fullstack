from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Islanders University API", version="0.1.0")

# Configuração temporária de CORS (vamos aprimorar depois)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # depois trocamos para o frontend Angular
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}