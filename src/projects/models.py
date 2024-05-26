from fastapi import HTTPException

from sqlalchemy import Column, VARCHAR, BOOLEAN
from sqlalchemy import CheckConstraint

from sqlalchemy import select, insert, update, delete
from sqlalchemy.ext.asyncio import AsyncSession

from models import BaseClass
from projects.shemas import ProjectType, ProjectSchema


class Project(BaseClass):
    __tablename__ = "bugtracker_project"

    name = Column(VARCHAR(255), unique=True, nullable=False)
    key = Column(VARCHAR(10), unique=True, nullable=False)
    type = Column(VARCHAR, nullable=False)
    starred = Column(BOOLEAN, default=False, nullable=False)

    CheckConstraint(
        sqltext=type.in_(
            [
                ProjectType.fullstack,
                ProjectType.frontend,
                ProjectType.backend
                ]
            ),
        name='project_type_check'
        )


async def create_project_db(
        session: AsyncSession,
        project: ProjectSchema
        ) -> ProjectSchema:

    stmt = insert(Project).values(**project.model_dump())
    await session.execute(stmt)
    await session.commit()

    return project


async def get_project_db(
        session: AsyncSession,
        project_id: int
        ) -> ProjectSchema:

    query = select(Project).where(Project.id == project_id)
    project = await session.scalar(query)

    if project is not None:
        return project
    else:
        raise HTTPException(404, "Project not found!")


async def update_project_db(
        session: AsyncSession,
        project_id: int,
        project: ProjectSchema
        ) -> ProjectSchema:

    stmt = update(Project).where(
        Project.id == project_id
        ).values(**project.model_dump()).returning(Project)
    updated_project = await session.scalar(stmt)

    if updated_project is None:
        await session.rollback()
        raise HTTPException(404, "Project not found!")
    else:
        await session.commit()
        return updated_project


async def delete_project_db(
        session: AsyncSession,
        project_id: int
        ) -> dict[str, str]:

    stmt = delete(Project).where(Project.id == project_id).returning(Project)
    result = await session.scalar(stmt)

    if result is None:
        await session.rollback()
        raise HTTPException(404, "Project not found!")
    else:
        await session.commit()
        return {"results": "Success"}
