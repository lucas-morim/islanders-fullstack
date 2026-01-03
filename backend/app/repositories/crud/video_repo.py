from typing import Sequence, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.video import Video


class VideoRepository:
    async def list(
        self,
        db: AsyncSession,
        skip: int = 0,
        limit: Optional[int] = None,
    ) -> Sequence[Video]:
        stmt = select(Video).offset(skip)

        if limit is not None:
            stmt = stmt.limit(limit)
            
        result = await db.execute(stmt)
        return result.scalars().all()

    async def get(
        self,
        db: AsyncSession,
        video_id: str,
    ) -> Optional[Video]:
        return await db.get(Video, video_id)

    async def get_by_title(
        self,
        db: AsyncSession,
        title: str,
    ) -> Optional[Video]:
        result = await db.execute(
            select(Video).where(Video.title == title)
        )
        return result.scalar_one_or_none()

    async def create(
        self,
        db: AsyncSession,
        *,
        title: str,
        video_url: str,
        description: Optional[str] = None,
    ) -> Video:
        video = Video(
            title=title,
            video_url=video_url,
            description=description,
        )
        db.add(video)
        await db.commit()
        await db.refresh(video)
        return video

    async def update(
        self,
        db: AsyncSession,
        video: Video,
        *,
        title: Optional[str] = None,
        video_url: Optional[str] = None,
        description: Optional[str] = None,
    ) -> Optional[Video]:
        if not video:
            return None

        if title is not None:
            video.title = title
        if video_url is not None:
            video.video_url = video_url
        if description is not None:
            video.description = description

        db.add(video)
        await db.commit()
        await db.refresh(video)
        return video

    async def delete(
        self,
        db: AsyncSession,
        video: Video,
    ) -> bool:
        if not video:
            return False

        await db.delete(video)
        await db.commit()
        return True
