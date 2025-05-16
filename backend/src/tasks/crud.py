from uuid import UUID

from fastapi import HTTPException

from sqlalchemy import select, insert, update, delete
from sqlalchemy.orm import joinedload
from sqlalchemy.ext.asyncio import AsyncSession

from src.auth.models import UserProjectRole
from src.projects.models import Project
from src.utils.db import handleDbUniqueError
from .models import Task
from .schemas import TaskSchema, TaskSchemaGet, CreatedTaskSchema


async def create_task_db(
    session: AsyncSession,
    user_id: UUID,
    project_id: UUID,
    task: TaskSchema
) -> CreatedTaskSchema:

    # Query to check if there is a project with the received id
    # TODO: Check user role before create project
    project_query = (
        select(Project.id)
        # Project.creator_id == user_id,
        .where(Project.id == project_id)
    )
    project = await session.scalar(project_query)

    if project is None:
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


async def get_tasks_db(
    session: AsyncSession,
    model: Task,
    user_id: UUID,
    offset: int,
    limit: int,
    project_id: UUID
) -> list[TaskSchemaGet]:
    tasks_query = (
        select(model)
        .options(
            joinedload(model.status_rel),
            joinedload(model.priority_rel),
            joinedload(model.type_rel)
        )
        .where(
            model.project_id == project_id,
        )
        .order_by(model.type_id, model.created_at)
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


async def get_task_db(
    session: AsyncSession,
    user_id: UUID,
    project_id: UUID,
    task_id: UUID
) -> TaskSchemaGet:
    task_query = (
        select(Task)
        .options(
            joinedload(Task.status_rel),
            joinedload(Task.priority_rel),
            joinedload(Task.type_rel)
        )
        .where(
            Task.id == task_id,
            Task.creator_id == user_id,
            Task.project_id == project_id
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


async def update_task_db(
    session: AsyncSession,
    user_id: UUID,
    project_id: UUID,
    task_id: UUID,
    task: TaskSchema
) -> TaskSchema:

    stmt = (
        update(Task)
        .where(
            Task.id == task_id,
            Task.creator_id == user_id,
            Task.project_id == project_id
        )
        .values(**task.model_dump(exclude_none=True))
        .returning(Task)
    )

    updated_task = await handleDbUniqueError(session, stmt)

    if updated_task is None:
        await session.rollback()
        raise HTTPException(400, "The task for the update doesn't exist!")
    else:
        await session.commit()
        return updated_task


async def delete_task_db(
    session: AsyncSession,
    user_id: UUID,
    project_id: UUID,
    task_id: UUID
) -> dict[str, str]:

    stmt = (
        delete(Task)
        .where(
            Task.id == task_id,
            Task.creator_id == user_id,
            Task.project_id == project_id
        )
        .returning(Task.id)
    )
    result = await session.scalar(stmt)

    if result is None:
        await session.rollback()
        raise HTTPException(
            status_code=400,
            detail="The task to delete doesn't exist!"
        )
    else:
        await session.commit()
        return {"result": "Success"}
