from datetime import datetime
from typing import Annotated
from uuid import UUID

from fastapi import Depends
from fastapi_users.db import SQLAlchemyUserDatabase

from sqlalchemy import VARCHAR, DateTime, false, select, true, text
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Mapped, mapped_column
from src.utils.db import Base, get_async_session, SMALLINT_PK, UUID_PK


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

    async def get_id(session: AsyncSession, user_id: UUID) -> str:
        user_id_query = select(User.id).where(User.id == user_id)
        return await session.scalar(user_id_query)

    async def get_email(session: AsyncSession, user_id: UUID) -> str:
        user_email_query = select(User.email).where(User.id == user_id)
        return await session.scalar(user_email_query)


class Role(Base):
    __tablename__ = 'role'

    id: Mapped[SMALLINT_PK]
    name: Mapped[str] = mapped_column(VARCHAR(20))
    description: Mapped[str] = mapped_column(VARCHAR(255))


async def get_user_db(session: AsyncSession = Depends(get_async_session)):
    yield SQLAlchemyUserDatabase(session, User)
