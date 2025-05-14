import re
from uuid import UUID

from fastapi import HTTPException

from sqlalchemy import select, insert, update, delete
from sqlalchemy.ext.asyncio import AsyncSession

from src.utils.db import handleDbUniqueError
from .schemas import ProjectSchema, CreatedProjectSchema, UpdateProjectSchema
from .models import Project


async def create_project_db(
    session: AsyncSession,
    user_id: UUID,
    project: ProjectSchema
) -> CreatedProjectSchema:
    is_valid_project_name(project.name)

    stmt = (
        insert(Project)
        .values(**project.model_dump(), creator_id=user_id)
        .returning(Project.id)
    )
    return await handleDbUniqueError(session, stmt, is_create=True)


async def get_projects_db(
    session: AsyncSession,
    model: ProjectSchema,
    user_id: UUID,
    offset: int,
    limit: int,
) -> list[ProjectSchema]:
    projects_query = (
        select(model)
        .where(model.creator_id == user_id)
        .order_by(model.is_favorite.desc(), model.created_at)
        .offset(offset)
        .limit(limit)
    )
    return await session.scalars(projects_query)


async def get_project_db(
    session: AsyncSession,
    user_id: UUID,
    project_id: UUID
) -> ProjectSchema:

    project_query = (
        select(Project)
        .where(Project.creator_id == user_id, Project.id == project_id)
    )
    project = await session.scalar(project_query)

    if project is None:
        raise HTTPException(404, "Project not found!")
    else:
        return project


async def update_project_db(
    session: AsyncSession,
    user_id: UUID,
    project_id: UUID,
    project: UpdateProjectSchema
) -> ProjectSchema:

    if project.name is not None:
        is_valid_project_name(project.name)

    stmt = (
        update(Project)
        .where(Project.creator_id == user_id, Project.id == project_id)
        .values(**project.model_dump(exclude_none=True))
        .returning(Project)
    )

    updated_project = await handleDbUniqueError(session, stmt)

    if updated_project is None:
        await session.rollback()
        raise HTTPException(400, "The project for the update doesn't exist!")
    else:
        await session.commit()
        return updated_project


async def delete_project_db(
    session: AsyncSession,
    user_id: UUID,
    project_id: UUID
) -> dict[str, str]:

    stmt = (
        delete(Project)
        .where(Project.creator_id == user_id, Project.id == project_id)
        .returning(Project)
    )
    result = await session.scalar(stmt)

    if result is None:
        await session.rollback()
        raise HTTPException(400, "The project to delete doesn't exist!")
    else:
        await session.commit()
        return {"results": "Success"}


def is_valid_project_name(project_name):
    """
    Raises an error if one of these characters is in the project name:
    back/forward slash, :, ?
    """
    pattern = re.compile(r"[\/\\:?=]")

    if pattern.search(project_name):
        raise HTTPException(
            status_code=400,
            detail="Slashes, ':', '?' and '=' not allowed in project name!"
        )
    return True
