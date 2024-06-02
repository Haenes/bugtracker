from typing import Annotated

from fastapi import APIRouter, Depends, Path

from sqlalchemy.ext.asyncio import AsyncSession

from db import get_async_session
from auth.manager import User, current_active_user
from pagination import (
    PaginatedResponse, NoItemsResponse, paginate, pagination_params
    )
from .schemas import CreateUpdateProjectSchema, ProjectSchema
from .models import Project
from .crud import (
    get_project_db, create_project_db,
    update_project_db, delete_project_db
    )


router = APIRouter(
    prefix="/projects",
    tags=["Projects"]
)


@router.get("/")
async def projects(
        pagination_params: pagination_params,
        session: AsyncSession = Depends(get_async_session),
        user: User = Depends(current_active_user)
        ) -> PaginatedResponse | NoItemsResponse:
    """ Return all user projects with pagination. """

    return await paginate(session, Project, pagination_params)


@router.post("/", status_code=201)
async def create_project(
        project: CreateUpdateProjectSchema,
        session: AsyncSession = Depends(get_async_session),
        user: User = Depends(current_active_user)
        ) -> CreateUpdateProjectSchema:
    """ Create a new project. """

    return await create_project_db(session, project)


@router.get("/{project_id}")
async def get_project(
        project_id: Annotated[int, Path(ge=1)],
        session: AsyncSession = Depends(get_async_session),
        user: User = Depends(current_active_user)
        ) -> ProjectSchema:
    """ Return specified project. """

    return await get_project_db(session, project_id)


@router.put("/{project_id}")
async def update_project(
        project_id: Annotated[int, Path(ge=1)],
        project: CreateUpdateProjectSchema,
        session: AsyncSession = Depends(get_async_session),
        user: User = Depends(current_active_user)
        ) -> CreateUpdateProjectSchema:
    """ Update already exists project via PUT request. """

    return await update_project_db(session, project_id, project)


@router.delete("/{project_id}")
async def delete_project(
        project_id: Annotated[int, Path(ge=1)],
        session: AsyncSession = Depends(get_async_session),
        user: User = Depends(current_active_user)
        ) -> dict[str, str]:
    """ Delete specified project. """

    return await delete_project_db(session, project_id)
