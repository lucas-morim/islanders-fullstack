from fastapi import APIRouter, UploadFile, File, HTTPException
from app.core.config import settings
import os
import uuid

router = APIRouter()

@router.post("/courses", summary="Upload de imagem de capa de curso")
async def upload_course_image(file: UploadFile = File(...)):
    if file.content_type not in ("image/jpeg", "image/png", "image/webp"):
        raise HTTPException(status_code=400, detail="Formato de imagem inválido")

    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in (".jpg", ".jpeg", ".png", ".webp"):
        ext = ".jpg"

    filename = f"{uuid.uuid4().hex}{ext}"

    upload_dir = os.path.join(settings.MEDIA_ROOT, "courses")
    os.makedirs(upload_dir, exist_ok=True)

    file_path = os.path.join(upload_dir, filename)

    contents = await file.read()
    with open(file_path, "wb") as f:
        f.write(contents)

    url = f"{settings.MEDIA_URL}/courses/{filename}"

    return {"url": url}
