from typing import Annotated
from datetime import datetime

from fastapi import Depends

from fastapi_users.db import SQLAlchemyUserDatabase

from sqlalchemy import VARCHAR, DateTime, false, true, text
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.ext.asyncio import AsyncSession

from db import Base, get_async_session, intpk


user = Annotated[str, mapped_column(VARCHAR(length=150))]
user_status = Annotated[
    bool, mapped_column(server_default=false())
    ]


class User(Base):
    __tablename__ = "auth_user"

    id: Mapped[intpk]
    is_superuser: Mapped[user_status]
    is_staff: Mapped[user_status]
    is_active: Mapped[user_status] = mapped_column(server_default=true())
    is_verified: Mapped[user_status]
    username: Mapped[user] = mapped_column(unique=True)
    hashed_password: Mapped[str] = mapped_column(VARCHAR(128))
    first_name: Mapped[user]
    last_name: Mapped[user]
    email: Mapped[str] = mapped_column(VARCHAR(254), unique=True, index=True)
    date_joined: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=text("CURRENT_TIMESTAMP")
        )
    last_login: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=text("CURRENT_TIMESTAMP")
        )


async def get_user_db(session: AsyncSession = Depends(get_async_session)):
    yield SQLAlchemyUserDatabase(session, User)
