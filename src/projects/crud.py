from fastapi import HTTPException

from sqlalchemy import select, insert, update, delete
from sqlalchemy.ext.asyncio import AsyncSession

from .shemas import ProjectSchema
from .models import Project


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

    if project is None:
        raise HTTPException(404, "Project not found!")
    else:
        return project


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
        raise HTTPException(400, "The project for the update doesn't exist!")
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
        raise HTTPException(400, "The project to delete doesn't exist!")
    else:
        await session.commit()
        return {"results": "Success"}
