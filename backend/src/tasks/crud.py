from uuid import UUID

from fastapi import HTTPException

from sqlalchemy import (
    select, insert,
    update as as_update, delete as as_delete
)
from sqlalchemy.orm import joinedload
from sqlalchemy.ext.asyncio import AsyncSession

from src.auth.models import UserProjectRole
from src.projects.models import Project
from src.utils.db import handleDbUniqueError
from .models import Task
from .schemas import TaskSchema, TaskSchemaGet, CreatedTaskSchema


async def create(
    session: AsyncSession,
    user_id: UUID,
    project_id: UUID,
    task: TaskSchema
) -> CreatedTaskSchema:
    await UserProjectRole.is_permitted(session, user_id, project_id)

    is_project_exist_query = select(Project.id).where(Project.id == project_id)
    is_project_exist = await session.scalar(is_project_exist_query)

    if not is_project_exist:
        await session.rollback()
        raise HTTPException(
            status_code=400,
            detail="You can't create an task for a non-existent project!"
        )
    else:
        stmt = (
            insert(Task)
            .values(
                **task.model_dump(),
                creator_id=user_id,
                project_id=project_id,
            )
            .returning(Task.id)
        )
        return await handleDbUniqueError(session, stmt, is_create=True)


async def read_all(
    session: AsyncSession,
    user_id: UUID,
    offset: int,
    limit: int,
    project_id: UUID
) -> list[TaskSchemaGet]:
    tasks_query = (
        select(Task)
        .options(
            joinedload(Task.status_rel),
            joinedload(Task.priority_rel),
            joinedload(Task.type_rel)
        )
        .where(Task.project_id == project_id)
        .order_by(Task.type_id, Task.created_at)
        .offset(offset)
        .limit(limit)
    )
    role_id_query = (
        select(UserProjectRole.role_id)
        .where(
            UserProjectRole.user_id == user_id,
            UserProjectRole.project_id == project_id
        )
    )
    tasks_result = await session.scalars(tasks_query)
    role_id_result = await session.scalar(role_id_query)
    return tasks_result.all(), role_id_result


async def read(
    session: AsyncSession,
    user_id: UUID,
    project_id: UUID,
    task_id: UUID
) -> TaskSchemaGet:
    # TODO: Remove relationships? Bcs they query all the fields of the joined tables.
    task_query = (
        select(Task)
        .join(UserProjectRole, Task.project_id == UserProjectRole.project_id)
        .options(
            joinedload(Task.status_rel),
            joinedload(Task.priority_rel),
            joinedload(Task.type_rel)
        )
        .where(
            UserProjectRole.user_id == user_id,
            Task.id == task_id,
            Task.project_id == project_id,
        )
    )

    task = await session.scalar(task_query)

    if task is None:
        raise HTTPException(
            status_code=404,
            detail="Task not found! Make sure that the correct data is passed."
        )
    else:
        return task


async def update(
    session: AsyncSession,
    user_id: UUID,
    project_id: UUID,
    task_id: UUID,
    task: TaskSchema
) -> TaskSchema:
    user_role_id = await UserProjectRole.read(session, user_id, project_id)
    is_assignee_query = (
        select(Task.assignee_id)
        .where(Task.assignee_id == user_id, Task.project_id == project_id)
    )
    is_assignee = await session.scalar(is_assignee_query)

    if user_role_id not in [1, 2] and not is_assignee:
        raise HTTPException(403, 'Not enough rights to perform the action!')

    stmt = (
        as_update(Task)
        .where(Task.id == task_id, Task.project_id == project_id)
        .values(**task.model_dump(exclude_none=True))
        .returning(Task)
    )
    updated_task = await handleDbUniqueError(session, stmt)

    if not updated_task:
        await session.rollback()
        raise HTTPException(400, "The task for the update doesn't exist!")
    else:
        await session.commit()
        return updated_task


async def delete(
    session: AsyncSession,
    user_id: UUID,
    project_id: UUID,
    task_id: UUID
) -> dict[str, str]:
    await UserProjectRole.is_permitted(session, user_id, project_id)

    stmt = (
        as_delete(Task)
        .where(
            Task.id == task_id,
            Task.creator_id == user_id,
            Task.project_id == project_id
        )
        .returning(Task.id)
    )
    is_deleted = await session.scalar(stmt)

    if not is_deleted:
        await session.rollback()
        raise HTTPException(
            status_code=400,
            detail="The task to delete doesn't exist!"
        )
    else:
        await session.commit()
        return {"result": "Success"}
