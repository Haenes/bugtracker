from datetime import datetime
from typing import Iterable
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy import (
    ForeignKey, DateTime,
    insert, select, func, literal,
    text, update as sa_update, delete as sa_delete
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy.ext.associationproxy import AssociationProxy

from src.auth.models import User
from src.auth.schemas import UsersInProjectSchema, NoUsersInProjectSchema
from src.utils.db import Base, UUID_PK, handleDbUniqueError


class BaseClass(Base):
    __abstract__ = True

    id: Mapped[UUID_PK]
    creator_id: Mapped[UUID] = mapped_column(
        ForeignKey('user.id', ondelete='CASCADE')
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=text('CURRENT_TIMESTAMP')
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        onupdate=text('CURRENT_TIMESTAMP'),
        server_default=text('CURRENT_TIMESTAMP')
    )


class UserProjectRole(Base):
    __tablename__ = 'user_project_role'

    user_id: Mapped[UUID] = mapped_column(
        ForeignKey('user.id', ondelete='CASCADE'),
        primary_key=True
    )
    project_id: Mapped[UUID] = mapped_column(
        ForeignKey('project.id', ondelete='CASCADE'),
        primary_key=True
    )
    role_id: Mapped[int] = mapped_column(
        ForeignKey('role.id', ondelete='CASCADE'),
        primary_key=True
    )
    joined_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=text('CURRENT_TIMESTAMP')
    )

    user_rel: Mapped[User] = relationship(innerjoin=True)
    username: AssociationProxy[str] = association_proxy('user_rel', 'username')

    async def create(
        session: AsyncSession,
        user_id: UUID,
        project_id: UUID,
        role_id: int = 1
    ):
        add_user_stmt = (
            insert(UserProjectRole)
            .values({
                'user_id': user_id,
                'project_id': project_id,
                'role_id': role_id
            })
            .returning(UserProjectRole.joined_at)
        )
        return await handleDbUniqueError(session, add_user_stmt)

    async def read(
        session: AsyncSession,
        user_id: UUID,
        project_id: UUID,
    ) -> int | None:
        query = (
            select(UserProjectRole.role_id)
            .where(
                UserProjectRole.user_id == user_id,
                UserProjectRole.project_id == project_id
            )
        )
        return await session.scalar(query)

    async def update(
        session: AsyncSession,
        user_id: UUID,
        project_id: UUID,
        user_to_update: UUID,
        role_id: int,
    ) -> dict[str, str]:
        await UserProjectRole.is_permitted(session, user_id, project_id)

        stmt = (
            sa_update(UserProjectRole)
            .values(role_id=role_id)
            .where(
                UserProjectRole.user_id == user_to_update,
                UserProjectRole.project_id == project_id,
            )
            .returning(UserProjectRole.role_id)
        )
        updated_role_id = await session.scalar(stmt)

        if updated_role_id != role_id:
            await session.rollback()
            raise HTTPException(500, 'Unexpected error, try again later')
        await session.commit()
        return {'status': 'Success'}

    async def delete(
        session: AsyncSession,
        user_id: UUID,
        project_id: UUID,
        user_to_delete: UUID
    ) -> dict[str, str]:
        await UserProjectRole.is_permitted(session, user_id, project_id)

        stmt = (
            sa_delete(UserProjectRole)
            .where(
                UserProjectRole.user_id == user_to_delete,
                UserProjectRole.project_id == project_id,
            )
            .returning(UserProjectRole.role_id)
        )
        is_deleted = await session.scalar(stmt)

        if not is_deleted:
            await session.rollback()
            raise HTTPException(500, 'Unexpected error, try again later')
        await session.commit()
        return {'status': 'Success'}

    async def read_all_users(
        session: AsyncSession,
        user_id: UUID,
        project_id: UUID,
    ) -> UsersInProjectSchema | NoUsersInProjectSchema:
        await UserProjectRole.is_permitted(session, user_id, project_id)

        users_query = (
            select(
                UserProjectRole.user_id,
                UserProjectRole.role_id,
                UserProjectRole.joined_at,
                User.username,
            )
            .join(User, User.id == UserProjectRole.user_id)
            .where(
                UserProjectRole.user_id != user_id,
                UserProjectRole.project_id == project_id,
            )
        )
        users_raw = await session.execute(users_query)
        users = users_raw.all()

        if not users:
            return NoUsersInProjectSchema(detail='So far, no one has joined.')
        return [
            {
                'user_id': user[0],
                'role_id': user[1],
                'joined_at': user[2],
                'username': user[3],
            } for user in users
        ]

    async def is_permitted(
        session: AsyncSession,
        user_id: UUID,
        project_id: UUID,
        permitted_roles: Iterable | None = (1, 2),
        error_message: str | None = None
    ):
        role_id = await UserProjectRole.read(session, user_id, project_id)

        if role_id not in permitted_roles:
            if error_message:
                raise HTTPException(403, error_message)
            raise HTTPException(403, 'Not enough rights to perform the action!')


def to_tsvector(*columns: str, regconfig: str = None):
    """
    Return to_tsvector postgresql function for specified columns.

    For some reason, asyncpg doesn't want to create an index
    if you pass REGCONFIG strings without literal().
    But if you use literal() for both index creation and search,
    the search will no longer work.

    Therefore, when creating an index (for example, for a test db),
    literal('english') is used, otherwise without literal().
    """
    string = " || ' ' || ".join(columns)

    return func.to_tsvector(
        regconfig if regconfig else literal('english'),
        text(string)
    )
