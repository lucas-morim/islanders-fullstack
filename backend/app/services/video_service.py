from typing import Sequence, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.repositories.crud.video_repo import VideoRepository
from app.models.video import Video


class VideoService:
    def __init__(self, repo: VideoRepository = VideoRepository()):
        self.repo = repo

    async def list(
        self,
        db: AsyncSession,
        skip: int = 0,
        limit: int = 100,
    ) -> Sequence[Video]:
        return await self.repo.list(db, skip=skip, limit=limit)

    async def get(
        self,
        db: AsyncSession,
        video_id: str,
    ) -> Video:
        video = await self.repo.get(db, video_id)
        if not video:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Video not found",
            )
        return video

    async def create(
        self,
        db: AsyncSession,
        *,
        title: str,
        video_url: str,
        description: Optional[str] = None,
    ) -> Video:
        existing_video = await self.repo.get_by_title(db, title)
        if existing_video:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Video title must be unique",
            )

        return await self.repo.create(
            db,
            title=title,
            video_url=video_url,
            description=description,
        )

    async def update(
        self,
        db: AsyncSession,
        video_id: str,
        *,
        title: Optional[str] = None,
        video_url: Optional[str] = None,
        description: Optional[str] = None,
    ) -> Video:
        video = await self.get(db, video_id)

        if title:
            existing_video = await self.repo.get_by_title(db, title)
            if existing_video and existing_video.id != video_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Video title must be unique",
                )

        return await self.repo.update(
            db,
            video,
            title=title,
            video_url=video_url,
            description=description,
        )

    async def delete(
        self,
        db: AsyncSession,
        video_id: str,
    ) -> None:
        video = await self.get(db, video_id)
        await self.repo.delete(db, video)


service = VideoService()
