from fastapi import APIRouter, UploadFile, File, HTTPException
from app.core.config import settings
import os
import uuid
from typing import Literal

router = APIRouter()

@router.post("/{kind}", summary="Upload de imagem (curso, usuário, etc)")
async def upload_image(
    kind: Literal["courses", "users"],  
    file: UploadFile = File(...)
):
    if file.content_type not in ("image/jpeg", "image/png", "image/webp"):
        raise HTTPException(status_code=400, detail="Formato de imagem inválido")

    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in (".jpg", ".jpeg", ".png", ".webp"):
        ext = ".jpg"

    filename = f"{uuid.uuid4().hex}{ext}"

    upload_dir = os.path.join(settings.MEDIA_ROOT, kind)
    os.makedirs(upload_dir, exist_ok=True)

    file_path = os.path.join(upload_dir, filename)

    contents = await file.read()
    with open(file_path, "wb") as f:
        f.write(contents)

    base = settings.MEDIA_URL.rstrip("/")  
    url = f"{base}/{kind}/{filename}"

    return {"url": url}