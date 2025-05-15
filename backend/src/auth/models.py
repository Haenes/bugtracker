from datetime import datetime
from typing import Annotated
from uuid import UUID

from fastapi import Depends

from fastapi_users.db import SQLAlchemyUserDatabase

from sqlalchemy import ForeignKey, VARCHAR, DateTime, false, insert, select, true, text
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.ext.asyncio import AsyncSession

from src.utils.db import (
    Base, get_async_session,
    handleDbUniqueError, SMALLINT_PK, UUID_PK
)


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


class Role(Base):
    __tablename__ = 'role'

    id: Mapped[SMALLINT_PK]
    name: Mapped[str] = mapped_column(VARCHAR(20))
    description: Mapped[str] = mapped_column(VARCHAR(255))


async def get_user_db(session: AsyncSession = Depends(get_async_session)):
    yield SQLAlchemyUserDatabase(session, User)
