from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from app.core.deps import get_db
from app.schemas.video import VideoCreate, VideoUpdate, VideoOut
from app.services.video_service import service as video_service

router = APIRouter()

@router.get("/", response_model=List[VideoOut])
async def list_videos(
    db: AsyncSession = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: Optional[int] = Query(None, ge=1)
):
    return await video_service.list(db, skip=skip, limit=limit)


@router.get("/{video_id}", response_model=VideoOut)
async def get_video(
    video_id: str,
    db: AsyncSession = Depends(get_db),
):
    return await video_service.get(db, video_id)


@router.post("/", response_model=VideoOut, status_code=status.HTTP_201_CREATED)
async def create_video(
    payload: VideoCreate,
    db: AsyncSession = Depends(get_db),
):
    return await video_service.create(
        db,
        title=payload.title,
        video_url=str(payload.video_url),
        description=payload.description,
    )


@router.put("/{video_id}", response_model=VideoOut)
async def update_video(
    video_id: str,
    payload: VideoUpdate,
    db: AsyncSession = Depends(get_db),
):
    return await video_service.update(
        db,
        video_id,
        title=payload.title,
        video_url=str(payload.video_url) if payload.video_url is not None else None,
        description=payload.description,
    )


@router.delete("/{video_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_video(
    video_id: str,
    db: AsyncSession = Depends(get_db),
):
    await video_service.delete(db, video_id)
    return None
