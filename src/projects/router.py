from typing import Annotated

from fastapi import APIRouter, Depends, Path

from sqlalchemy import select, insert, update, delete
from sqlalchemy.ext.asyncio import AsyncSession

from db import get_async_session
from projects.shemas import ProjectSchema
from projects.models import Project


router = APIRouter(
    prefix="/projects",
    tags=["Projects"]
)


@router.get("/")
async def projects(
        session: AsyncSession = Depends(get_async_session)
        ) -> list[ProjectSchema]:
    """ Return all user projects with pagination = 10 projects/page. """

    query = select(Project)
    results = await session.execute(query)

    return results.scalars().all()


@router.post("/", status_code=201)
async def create_project(
        project: ProjectSchema,
        session: AsyncSession = Depends(get_async_session)
        ) -> ProjectSchema:
    """ Create a new project. """

    stmt = insert(Project).values(**project.model_dump())
    await session.execute(stmt)
    await session.commit()

    return project


@router.get("/{project_id}")
async def get_project(
        project_id: Annotated[int, Path(ge=1)],
        session: AsyncSession = Depends(get_async_session)
        ) -> ProjectSchema:
    """ Return specified project. """

    query = select(Project).where(Project.id == project_id)
    results = await session.execute(query)

    return results.scalar()


@router.put("/{project_id}")
async def update_project(
        project_id: Annotated[int, Path(ge=1)],
        project: ProjectSchema,
        session: AsyncSession = Depends(get_async_session)
        ) -> ProjectSchema:
    """ Update already exists project via PUT request. """

    stmt = update(Project).where(
        Project.id == project_id
        ).values(**project.model_dump())
    await session.execute(stmt)
    await session.commit()

    return project


@router.delete("/{project_id}")
async def delete_project(
        project_id: Annotated[int, Path(ge=1)],
        session: AsyncSession = Depends(get_async_session)
        ):
    """ Delete specified project. """

    stmt = delete(Project).where(Project.id == project_id)
    await session.execute(stmt)
    await session.commit()

    return {"results": "success"}
