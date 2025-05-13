from uuid import UUID

from fastapi import APIRouter, Depends

from sqlalchemy.ext.asyncio import AsyncSession

from src.auth.manager import User, current_active_user
from src.utils.db import get_async_session
from src.utils.cache import (
    Redis, get_redis_client,
    cache_get_or_set, cache_delete_all
)
from src.utils.pagination import (
    PaginatedResponse, NoItemsResponse,
    pagination_params, ProjectsPagination
)
from .schemas import (
    CreateProjectSchema,
    ProjectSchema, CreatedProjectSchema,
    UpdateProjectSchema
)
from .models import Project
from .crud import (
    get_project_db, create_project_db,
    update_project_db, delete_project_db
)


router = APIRouter(
    prefix="/projects",
    tags=["Projects"]
)


@router.get("")
async def projects(
    pagination_params: pagination_params,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
    cache: Redis = Depends(get_redis_client)
) -> PaginatedResponse | NoItemsResponse:
    """ Return all user projects with pagination. """

    return await cache_get_or_set(
        cache,
        f"projects_{user.id}_{pagination_params}",
        ProjectsPagination.get_paginated,
        session, Project, pagination_params, user.id
    )


@router.post("", status_code=201)
async def create_project(
    project: CreateProjectSchema,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
    cache: Redis = Depends(get_redis_client)
) -> CreatedProjectSchema:
    """ Create a new project. """

    await cache_delete_all(cache, f"projects_{user.id}_*")
    return await create_project_db(session, user.id, project)


@router.get("/{project_id}")
async def get_project(
    project_id: UUID,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user)
) -> ProjectSchema:
    """ Return specified project. """

    return await get_project_db(session, user.id, project_id)


@router.patch("/{project_id}")
async def update_project(
    project_id: UUID,
    project: UpdateProjectSchema,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
    cache: Redis = Depends(get_redis_client)
) -> ProjectSchema:
    """ Update already exists project via PATCH request. """

    await cache_delete_all(cache, f"projects_{user.id}_*")
    return await update_project_db(session, user.id, project_id, project)


@router.delete("/{project_id}")
async def delete_project(
    project_id: UUID,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
    cache: Redis = Depends(get_redis_client)
) -> dict[str, str]:
    """ Delete specified project. """

    await cache_delete_all(cache, f"projects_{user.id}_*")
    return await delete_project_db(session, user.id, project_id)
