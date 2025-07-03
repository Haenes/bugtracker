from datetime import datetime
from uuid import UUID

from fastapi import HTTPException

from sqlalchemy import (
    TEXT, SMALLINT, VARCHAR, DateTime,
    ForeignKey, Index, UniqueConstraint,
    text as sa_text, select, insert,
    update as as_update, delete as as_delete
)
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy.ext.associationproxy import AssociationProxy
from sqlalchemy.orm import Mapped, mapped_column, relationship, joinedload

from src.projects.models import Project
from src.utils.db import Base, SMALLINT_PK, BIGINT_PK, handleDbUniqueError
from src.models import BaseClass, UserProjectRole, to_tsvector
from .schemas import (
    TaskSchema, TaskSchemaGet, CreatedTaskSchema,
    CreateTaskCommentSchema, TaskCommentSchema,
    NoTaskCommentsResponse, NoTaskChangesResponse
)


class Task(BaseClass):
    __tablename__ = 'task'

    project_id: Mapped[UUID] = mapped_column(
        ForeignKey('project.id', ondelete='CASCADE')
    )
    assignee_id: Mapped[UUID | None] = mapped_column(
        ForeignKey('user.id', ondelete='CASCADE'),
        nullable=True
    )
    name: Mapped[str] = mapped_column(VARCHAR(100))
    description: Mapped[str | None] = mapped_column(TEXT, nullable=True)
    type_id: Mapped[int] = mapped_column(ForeignKey('task_type.id', ondelete='CASCADE'))
    priority_id: Mapped[int] = mapped_column(
        ForeignKey('task_priority.id', ondelete='CASCADE')
    )
    status_id: Mapped[int] = mapped_column(
        ForeignKey('task_status.id', ondelete='CASCADE')
    )
    deadline_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )

    type_rel: Mapped['TaskType'] = relationship(innerjoin=True)
    priority_rel: Mapped['TaskPriority'] = relationship(innerjoin=True)
    status_rel: Mapped['TaskStatus'] = relationship(innerjoin=True)

    type: AssociationProxy[str] = association_proxy('type_rel', 'name')
    priority: AssociationProxy[str] = association_proxy('priority_rel', 'name')
    status: AssociationProxy[str] = association_proxy('status_rel', 'name')

    __table_args__ = (
        UniqueConstraint('name', 'project_id'),
        Index(
            'ix_task_fts',
            to_tsvector('name', 'description'),
            postgresql_using='gin'
        ),
    )

    async def is_exist(
        session: AsyncSession,
        user_id: UUID,
        project_id: UUID,
        task_id: UUID
    ):
        is_exist_query = (
            select(Task.id)
            .join(UserProjectRole, Task.project_id == UserProjectRole.project_id)
            .where(
                UserProjectRole.user_id == user_id,
                Task.project_id == project_id,
                Task.id == task_id,
            )
        )
        is_exist = await session.scalar(is_exist_query)

        if not is_exist:
            raise HTTPException(
                status_code=404,
                detail='Task not found! Make sure that the correct data is passed.'
            )

    async def create(
        session: AsyncSession,
        user_id: UUID,
        project_id: UUID,
        task: TaskSchema
    ) -> CreatedTaskSchema:
        await UserProjectRole.is_permitted(session, user_id, project_id)
        await Project.is_exist(session, user_id, project_id)

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

    async def update(
        session: AsyncSession,
        user_id: UUID,
        project_id: UUID,
        task_id: UUID,
        task: TaskSchema
    ) -> TaskSchema | dict[str, str]:
        await is_permitted_task(session, user_id, project_id, task_id)

        current_task_data = await Task.read(session, user_id, project_id, task_id)
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
        updated_task = await handleDbUniqueError(
            session=session,
            stmt=update_stmt,
            is_task_update=True
        )

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


class TaskPriority(Base):
    __tablename__ = 'task_priority'

    id: Mapped[SMALLINT_PK]
    name: Mapped[str] = mapped_column(VARCHAR(20))
    weight: Mapped[int] = mapped_column(SMALLINT)


class TaskType(Base):
    __tablename__ = 'task_type'

    id: Mapped[SMALLINT_PK]
    name: Mapped[str] = mapped_column(VARCHAR(20))


class TaskStatus(Base):
    __tablename__ = 'task_status'

    id: Mapped[SMALLINT_PK]
    name: Mapped[str] = mapped_column(VARCHAR(20))


class TaskHistory(Base):
    __tablename__ = 'task_history'

    id: Mapped[BIGINT_PK]
    task_id: Mapped[UUID] = mapped_column(
        ForeignKey('task.id', ondelete='CASCADE')
    )
    changed_by: Mapped[UUID] = mapped_column(
        ForeignKey('user.id', ondelete='CASCADE')
    )
    operation_id: Mapped[UUID] = mapped_column(
        server_default=sa_text('gen_random_uuid()')
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=sa_text('CURRENT_TIMESTAMP')
    )

    async def create(
        session: AsyncSession,
        user_id: UUID,
        task_id: UUID,
    ):
        create_stmt = (
            insert(TaskHistory)
            .values(task_id=task_id, changed_by=user_id)
            .returning(TaskHistory.id)
        )
        history_id = await session.scalar(create_stmt)

        if not history_id:
            await session.rollback()
            raise HTTPException(500, 'Unexpected error, try again later')
        # await session.commit will be called in function that calling it.
        # Check tasks.crud.update
        return history_id


class TaskHistoryChanges(Base):
    __tablename__ = 'task_history_changes'

    id: Mapped[BIGINT_PK]
    history_id: Mapped[int] = mapped_column(
        ForeignKey('task_history.id', ondelete='CASCADE')
    )
    field: Mapped[str] = mapped_column(VARCHAR(20))
    old_value: Mapped[str] = mapped_column(TEXT)
    new_value: Mapped[str] = mapped_column(TEXT)

    async def create(
        session: AsyncSession,
        changes: list[dict],
    ):
        create_stmt = (
            insert(TaskHistoryChanges)
            .values(changes)
            .returning(TaskHistoryChanges.id)
        )
        is_created = await session.scalar(create_stmt)

        if not is_created:
            await session.rollback()
            raise HTTPException(500, 'Unexpected error, try again later')
        # await session.commit will be called in function that calling it.
        # Check tasks.crud.update

    async def read_all(
        session: AsyncSession,
        user_id: UUID,
        project_id: UUID,
        task_id: UUID,
    ):
        await UserProjectRole.is_permitted(session, user_id, project_id, (1, 2, 3))
        await Task.is_exist(session, user_id, project_id, task_id)

        task_changes_query = (
            select(
                TaskHistory.operation_id,
                TaskHistory.changed_by,
                TaskHistoryChanges.field,
                TaskHistoryChanges.old_value,
                TaskHistoryChanges.new_value,
                TaskHistory.created_at,
            )
            .join(TaskHistory, TaskHistory.id == TaskHistoryChanges.history_id)
            .where(TaskHistory.task_id == task_id)
            .order_by(TaskHistory.created_at)
        )
        task_changes_raw = await session.execute(task_changes_query)
        task_changes = task_changes_raw.all()

        # Create a list with tuple's of unique operation_id
        # and related changed_by + created_at.
        # It's necessary, for example, when there are
        # 2+ changes within the same operation_id,
        # because it allows you to get rid of the duplicate operation_id.
        unique_operations = [(task[0], task[1], task[5]) for task in task_changes]

        operations = {
            unique_operation[0]:  {
                'operation_id': unique_operation[0],
                'changed_by': unique_operation[1],
                'created_at': unique_operation[2],
                'changes': [],
            }
            for unique_operation in unique_operations
        }

        for task in task_changes:
            if task[0] == operations[task[0]]['operation_id']:
                operations[task[0]]['changes'].append(
                    {
                        'field': task[2],
                        'old_value': task[3],
                        'new_value': task[4],
                    }
                )

        if operations:
            return [operation for operation in operations.values()]
        return NoTaskChangesResponse(results='No changes yet.')


class TaskComment(Base):
    __tablename__ = 'task_comment'

    id: Mapped[BIGINT_PK]
    user_id: Mapped[UUID] = mapped_column(
        ForeignKey('user.id', ondelete='CASCADE')
    )
    task_id: Mapped[UUID] = mapped_column(
        ForeignKey('task.id', ondelete='CASCADE')
    )
    text: Mapped[str] = mapped_column(TEXT)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=sa_text('CURRENT_TIMESTAMP')
    )

    async def create(
        session: AsyncSession,
        user_id: UUID,
        project_id: UUID,
        task_id: UUID,
        comment: CreateTaskCommentSchema
    ) -> CreatedTaskSchema:
        await is_permitted_task(session, user_id, project_id, task_id)
        await Project.is_exist(session, user_id, project_id)
        await Task.is_exist(session, user_id, project_id, task_id)

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

    async def read_all(
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
