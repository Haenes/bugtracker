from uuid import UUID

from fastapi import APIRouter, Depends

from sqlalchemy.ext.asyncio import AsyncSession

from src.utils.db import get_async_session
from src.utils.cache import (
    Redis, get_redis_client,
    cache_get_or_set, cache_delete_all
)
from src.auth.manager import User, current_active_user
from src.utils.pagination import (
    PaginatedResponse, NoItemsResponse,
    pagination_params, TasksPagination
)
from .schemas import (
    CreateTaskSchema, TaskSchemaGet,  UpdateTaskSchema,
    CreatedTaskSchema, TaskSchema
)
from .models import Task
from .crud import (
    create_task_db, get_task_db,
    update_task_db, delete_task_db
)


router = APIRouter(
    prefix="/projects/{project_id}/tasks",
    tags=["Tasks"]
)


@router.get("")
async def get_tasks(
    project_id: UUID,
    pagination_params: pagination_params,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
    cache: Redis = Depends(get_redis_client)
) -> PaginatedResponse | NoItemsResponse:
    """ Return all tasks related with specified project with pagination. """
    return await cache_get_or_set(
        cache,
        f"tasks_project_{project_id}_{pagination_params}",
        TasksPagination.get_paginated,
        session, Task, pagination_params, user.id, project_id
    )


@router.post("", status_code=201)
async def create_task(
    project_id: UUID,
    task: CreateTaskSchema,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
    cache: Redis = Depends(get_redis_client)
) -> CreatedTaskSchema:
    """ Create a new task related to the specified project """
    await cache_delete_all(cache, f"tasks_project_{project_id}_*")
    return await create_task_db(session, user.id, project_id, task)


@router.get("/{task_id}")
async def get_task(
    project_id: UUID,
    task_id: UUID,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user)
) -> TaskSchemaGet:
    """ Return an task related to the specified project """
    return await get_task_db(session, user.id, project_id, task_id)


@router.patch("/{task_id}")
async def update_task(
    project_id: UUID,
    task_id: UUID,
    task: UpdateTaskSchema,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
    cache: Redis = Depends(get_redis_client)
) -> TaskSchema:
    """ Update an task related to the specified project """
    await cache_delete_all(cache, f"tasks_project_{project_id}_*")
    return await update_task_db(session, user.id, project_id, task_id, task)


@router.delete("/{task_id}")
async def delete_task(
    project_id: UUID,
    task_id: UUID,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
    cache: Redis = Depends(get_redis_client)
):
    """ Delete specified task from specified project """
    await cache_delete_all(cache, f"tasks_project_{project_id}_*")
    return await delete_task_db(session, user.id, project_id, task_id)
