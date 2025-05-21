from datetime import datetime
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
    PaginatedTasksResponse, NoTasksResponse,
    pagination_params, TasksPagination
)
from .models import Task, TaskComment, TaskHistoryChanges
from .schemas import (
    CreateTaskSchema, TaskSchemaGet,  UpdateTaskSchema,
    CreatedTaskSchema, TaskSchema,
    CreateTaskCommentSchema, TaskCommentSchema,
    NoTaskCommentsResponse, NoTaskChangesResponse
)


router = APIRouter(
    prefix="/projects/{project_id}/tasks",
    tags=["Tasks"]
)
TASK_CHANGES_ANNOTATION = list[
    dict[
        str,
        UUID | datetime | str | list[dict[str, str]]
    ]
]


@router.get("")
async def get_tasks(
    project_id: UUID,
    pagination_params: pagination_params,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
    cache: Redis = Depends(get_redis_client)
) -> PaginatedTasksResponse | NoTasksResponse:
    """ Return all tasks related with specified project with pagination. """
    return await cache_get_or_set(
        cache,
        f"tasks_project_{project_id}_{pagination_params}",
        TasksPagination.get_paginated,
        session, pagination_params, user.id, project_id
    )


@router.post("", status_code=201)
async def create_task(
    project_id: UUID,
    task: CreateTaskSchema,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
    cache: Redis = Depends(get_redis_client)
) -> CreatedTaskSchema:
    await cache_delete_all(cache, f"tasks_project_{project_id}_*")
    return await Task.create(session, user.id, project_id, task)


@router.get("/{task_id}")
async def get_task(
    project_id: UUID,
    task_id: UUID,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user)
) -> TaskSchemaGet:
    return await Task.read(session, user.id, project_id, task_id)


@router.patch("/{task_id}")
async def update_task(
    project_id: UUID,
    task_id: UUID,
    task: UpdateTaskSchema,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
    cache: Redis = Depends(get_redis_client)
) -> TaskSchema | dict[str, str]:
    await cache_delete_all(cache, f"tasks_project_{project_id}_*")
    return await Task.update(session, user.id, project_id, task_id, task)


@router.delete("/{task_id}")
async def delete_task(
    project_id: UUID,
    task_id: UUID,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
    cache: Redis = Depends(get_redis_client)
):
    await cache_delete_all(cache, f"tasks_project_{project_id}_*")
    return await Task.delete(session, user.id, project_id, task_id)


@router.post('/{task_id}/comments')
async def add_comment_to_task(
    project_id: UUID,
    task_id: UUID,
    comment: CreateTaskCommentSchema,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
) -> dict[str, str | datetime]:
    return await TaskComment.create(session, user.id, project_id, task_id, comment)


@router.get('/{task_id}/comments')
async def get_comments(
    project_id: UUID,
    task_id: UUID,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
) -> list[TaskCommentSchema] | NoTaskCommentsResponse:
    return await TaskComment.read_all(session, user.id, project_id, task_id)


@router.get('/{task_id}/changes')
async def get_task_changes_history(
    project_id: UUID,
    task_id: UUID,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
) -> TASK_CHANGES_ANNOTATION | NoTaskChangesResponse:
    return await TaskHistoryChanges.read_all(session, user.id, project_id, task_id)
