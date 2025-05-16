from datetime import datetime
from typing import Annotated
from uuid import UUID

from fastapi import Depends, HTTPException

from fastapi_users.db import SQLAlchemyUserDatabase

from sqlalchemy import (
    ForeignKey, VARCHAR, DateTime, delete,
    false, insert, select,
    true, text, update
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy.ext.associationproxy import AssociationProxy

from src.utils.db import (
    Base, get_async_session,
    handleDbUniqueError, SMALLINT_PK, UUID_PK
)
from .schemas import NoUsersInProjectSchema


USER_STATUS = Annotated[bool, mapped_column(server_default=false())]


class User(Base):
    __tablename__ = 'user'

    id: Mapped[UUID_PK]
    is_superuser: Mapped[USER_STATUS]
    is_active: Mapped[USER_STATUS] = mapped_column(server_default=true())
    is_verified: Mapped[USER_STATUS]
    username: Mapped[str] = mapped_column(VARCHAR(length=50), unique=True)
    first_name: Mapped[str] = mapped_column(VARCHAR(length=150))
    hashed_password: Mapped[str] = mapped_column(VARCHAR(128))
    email: Mapped[str] = mapped_column(VARCHAR(254), unique=True, index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=text('CURRENT_TIMESTAMP')
    )

    async def get_email(session: AsyncSession, user_id: UUID) -> str:
        user_email_query = select(User.email).where(User.id == user_id)
        user_email = await session.scalar(user_email_query)
        return user_email


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

    async def add(
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

    async def get(
        session: AsyncSession,
        user_id: UUID,
        project_id: UUID,
    ):
        query = (
            select(UserProjectRole.role_id)
            .where(
                UserProjectRole.user_id == user_id,
                UserProjectRole.project_id == project_id
            )
        )
        return await session.scalar(query)

    async def update_user_role(
        session: AsyncSession,
        user_id: UUID,
        role_id: int,
        project_id: UUID,
    ):
        stmt = (
            update(UserProjectRole)
            .values(role_id=role_id)
            .where(
                UserProjectRole.user_id == user_id,
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

    async def delete_user_from_project(
        session: AsyncSession,
        user_id: UUID,
        project_id: UUID,
    ):
        stmt = (
            delete(UserProjectRole)
            .where(
                UserProjectRole.user_id == user_id,
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

    async def users_in_project(
        session: AsyncSession,
        user_id: UUID,
        project_id: UUID,
    ):
        # TODO: Check user permission to get this info
        # user_role = await UserProjectRole.get(session, user_id, project_id)
        query = (
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
        result = await session.execute(query)
        users = result.all()

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


class Role(Base):
    __tablename__ = 'role'

    id: Mapped[SMALLINT_PK]
    name: Mapped[str] = mapped_column(VARCHAR(20))
    description: Mapped[str] = mapped_column(VARCHAR(255))


async def get_user_db(session: AsyncSession = Depends(get_async_session)):
    yield SQLAlchemyUserDatabase(session, User)
