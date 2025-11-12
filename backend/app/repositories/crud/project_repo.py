from typing import Sequence, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.project import Project


class ProjectRepository:
    async def list(self, db: AsyncSession, *, skip: int = 0, limit: int = 100) -> Sequence[Project]:
        result = await db.execute(select(Project).offset(skip).limit(limit))
        return result.scalars().all()

    async def get(self, db: AsyncSession, project_id: str) -> Optional[Project]:
        return await db.get(Project, project_id)

    async def get_by_title(self, db: AsyncSession, title: str) -> Optional[Project]:
        stmt = select(Project).where(Project.title == title)
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

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
        #converte http para string (estava a dar erro do Postgre)
        if project_url is not None:
            project_url = str(project_url)
        
        obj = Project(
            title=title,
            description=description,
            project_url=project_url,
            file_path=file_path,
            user_id=user_id,
            course_id=course_id,
        )
        db.add(obj)
        await db.commit()
        await db.refresh(obj)
        return obj

    async def update(
        self,
        db: AsyncSession,
        project: Project,
        *,
        title: Optional[str] = None,
        description: Optional[str] = None,
        project_url: Optional[str] = None,
        file_path: Optional[str] = None,
        course_id: Optional[str] = None
    ) -> Project:
        if title is not None:
            project.title = title
        if description is not None:
            project.description = description
        if project_url is not None:
            project.project_url = str(project_url)
        if file_path is not None:
            project.file_path = file_path
        if course_id is not None:
            project.course_id = course_id

        db.add(project)
        await db.commit()
        await db.refresh(project)
        return project

    async def delete(self, db: AsyncSession, project: Project) -> bool:
        if not project:
            return None
        await db.delete(project)
        await db.commit()
        return True
