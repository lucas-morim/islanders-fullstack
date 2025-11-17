from typing import Sequence, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from app.repositories.crud.project_repo import ProjectRepository
from app.models.project import Project


class ProjectService:
    def __init__(self):
        self.repo = ProjectRepository()

    async def list(self, db: AsyncSession, skip: int = 0, limit: int = 100) -> Sequence[Project]:
        return await self.repo.list(db, skip=skip, limit=limit)

    async def get(self, db: AsyncSession, project_id: str) -> Project:
        project = await self.repo.get(db, project_id)
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )
        return project

    async def create(
        self,
        db: AsyncSession,
        *,
        title: str,
        description: Optional[str],
        project_url: Optional[str],
        file_path: Optional[str],
        user_id: str,
        course_id: str
    ) -> Project:
        existing = await self.repo.get_by_title(db, title)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Project title must be unique"
            )

        return await self.repo.create(
            db,
            title=title,
            description=description,
            project_url=project_url,
            file_path=file_path,
            user_id=user_id,
            course_id=course_id,
        )

    async def update(
        self,
        db: AsyncSession,
        project_id: str,
        *,
        title: Optional[str] = None,
        description: Optional[str] = None,
        project_url: Optional[str] = None,
        file_path: Optional[str] = None,
        course_id: Optional[str] = None
    ) -> Project:
        project = await self.get(db, project_id)

        if title:
            existing = await self.repo.get_by_title(db, title)
            if existing and existing.id != project_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Project title must be unique"
                )

        return await self.repo.update(
            db,
            project,
            title=title,
            description=description,
            project_url=project_url,
            file_path=file_path,
            course_id=course_id,
        )

    async def delete(self, db: AsyncSession, project_id: str) -> None:
        project = await self.get(db, project_id)
        await self.repo.delete(db, project)


service = ProjectService()
