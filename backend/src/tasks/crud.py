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
from .models import (
    Task, TaskComment, TaskHistory,
    TaskHistoryChanges, TaskPriority,
    TaskStatus, TaskType
)
from .schemas import (
    TaskSchema, TaskSchemaGet, CreatedTaskSchema,
    CreateTaskCommentSchema, TaskCommentSchema, NoTaskCommentsResponse
)


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
    await UserProjectRole.is_permitted(session, user_id, project_id, (1, 2, 3))

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
    tasks_result = await session.scalars(tasks_query)
    role_id = await UserProjectRole.read(session, user_id, project_id)
    return tasks_result.all(), role_id


async def read(
    session: AsyncSession,
    user_id: UUID,
    project_id: UUID,
    task_id: UUID
) -> TaskSchemaGet:
    await UserProjectRole.is_permitted(session, user_id, project_id, (1, 2, 3))

    task_query = (
        select(Task, TaskStatus.name, TaskPriority.name, TaskType.name)
        .join(UserProjectRole, UserProjectRole.project_id == Task.project_id)
        .join(TaskStatus, TaskStatus.id == Task.status_id)
        .join(TaskPriority, TaskPriority.id == Task.priority_id)
        .join(TaskType, TaskType.id == Task.type_id)
        .where(
            UserProjectRole.user_id == user_id,
            Task.id == task_id,
            Task.project_id == project_id,
        )
    )

    task_raw = await session.execute(task_query)
    task = task_raw.first()

    if task is None:
        raise HTTPException(
            status_code=404,
            detail="Task not found! Make sure that the correct data is passed."
        )
    else:
        return TaskSchemaGet(
            **task[0].columns_to_dict(),
            status=task[1],
            priority=task[2],
            type=task[3]
        )


async def is_permitted_task(
    session: AsyncSession,
    user_id: UUID,
    project_id: UUID,
    task_id: UUID
):
    '''Check if user is admin/priveleged user or user that is assign to this task.'''
    user_role_id = await UserProjectRole.read(session, user_id, project_id)
    is_assignee_query = (
        select(Task.assignee_id)
        .where(
            Task.assignee_id == user_id,
            Task.project_id == project_id,
            Task.id == task_id
        )
    )
    is_assignee = await session.scalar(is_assignee_query)

    if user_role_id not in [1, 2] and not is_assignee:
        raise HTTPException(403, 'Not enough rights to perform the action!')


async def update(
    session: AsyncSession,
    user_id: UUID,
    project_id: UUID,
    task_id: UUID,
    task: TaskSchema
) -> TaskSchema | dict[str, str]:
    await is_permitted_task(session, user_id, project_id, task_id)

    current_task_data = await read(session, user_id, project_id, task_id)
    new_task_data = task.model_dump(exclude_none=True)
    history_id = await TaskHistory.create(session, user_id, task_id)

    changes = [
        {
            'history_id': history_id,
            'field': field,
            'old_value': str(current_task_data.__getattribute__(field)),
            'new_value': str(new_value)
        }
        for field, new_value in new_task_data.items()
        if current_task_data.__getattribute__(field) != new_value
    ]

    if not changes:
        await session.rollback()
        return {'result': 'Nothing to update!'}

    update_stmt = (
        as_update(Task)
        .where(Task.id == task_id, Task.project_id == project_id)
        .values(**new_task_data)
        .returning(Task)
    )
    updated_task = await handleDbUniqueError(session, update_stmt, is_task_update=True)

    await TaskHistoryChanges.create(session, changes)
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


async def create_comment(
    session: AsyncSession,
    user_id: UUID,
    project_id: UUID,
    task_id: UUID,
    comment: CreateTaskCommentSchema
) -> CreatedTaskSchema:
    await is_permitted_task(session, user_id, project_id, task_id)

    await Task.is_exist(session, user_id, project_id, task_id)

    # TODO: Move is project exist check to Project model
    is_project_exist_query = select(Project.id).where(Project.id == project_id)
    is_project_exist = await session.scalar(is_project_exist_query)

    if not is_project_exist:
        await session.rollback()
        raise HTTPException(
            status_code=400,
            detail="You can't add a comment to task for a non-existent project!"
        )

    else:
        stmt = (
            insert(TaskComment)
            .values(
                text=comment.text,
                user_id=user_id,
                task_id=task_id,
            )
            .returning(TaskComment.created_at)
        )
        created_comment = await session.scalar(stmt)

        if created_comment:
            await session.commit()
            return {'created_at': created_comment}
        await session.rollback()
        raise HTTPException(500, 'Unexpected error, try again later')


async def read_all_comments(
    session: AsyncSession,
    user_id: UUID,
    project_id: UUID,
    task_id: UUID,
) -> list[TaskCommentSchema] | NoTaskCommentsResponse:
    await UserProjectRole.is_permitted(session, user_id, project_id, (1, 2, 3))
    await Task.is_exist(session, user_id, project_id, task_id)

    comments_query = (
        select(TaskComment)
        .where(TaskComment.task_id == task_id)
        .order_by(TaskComment.created_at)
    )
    comments_result = await session.scalars(comments_query)

    if comments := comments_result.all():
        return comments
    return NoTaskCommentsResponse(results='No comments yet.')
