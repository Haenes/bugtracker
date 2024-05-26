from typing import Annotated

from fastapi import APIRouter, Depends, Path

from sqlalchemy.ext.asyncio import AsyncSession

from db import get_async_session
from pagination import paginate, PaginatedResponse
from projects.shemas import ProjectSchema
from projects.models import (
    Project, get_project_db, create_project_db,
    update_project_db, delete_project_db
    )


router = APIRouter(
    prefix="/projects",
    tags=["Projects"]
)


@router.get("/")
async def projects(
        session: AsyncSession = Depends(get_async_session),
        page: int = 1,
        limit: int = 10
        ) -> PaginatedResponse:
    """ Return all user projects with pagination. """

    return await paginate(session, Project, page, limit)


@router.post("/", status_code=201)
async def create_project(
        project: ProjectSchema,
        session: AsyncSession = Depends(get_async_session)
        ) -> ProjectSchema:
    """ Create a new project. """

    return await create_project_db(session, project)


@router.get("/{project_id}")
async def get_project(
        project_id: Annotated[int, Path(ge=1)],
        session: AsyncSession = Depends(get_async_session)
        ) -> ProjectSchema:
    """ Return specified project. """

    return await get_project_db(session, project_id)


@router.put("/{project_id}")
async def update_project(
        project_id: Annotated[int, Path(ge=1)],
        project: ProjectSchema,
        session: AsyncSession = Depends(get_async_session)
        ) -> ProjectSchema:
    """ Update already exists project via PUT request. """

    return await update_project_db(session, project_id, project)


@router.delete("/{project_id}")
async def delete_project(
        project_id: Annotated[int, Path(ge=1)],
        session: AsyncSession = Depends(get_async_session)
        ) -> dict[str, str]:
    """ Delete specified project. """

    return await delete_project_db(session, project_id)
