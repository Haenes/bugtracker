from typing import Annotated
from datetime import datetime

from sqlalchemy import VARCHAR, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from db import Base, intpk


user = Annotated[str, mapped_column(VARCHAR(length=150))]
user_status = Annotated[bool, mapped_column(default=False)]


class User(Base):
    __tablename__ = "auth_user"

    id: Mapped[intpk]
    password: Mapped[str] = mapped_column(VARCHAR(128))
    last_login: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    is_superuser: Mapped[user_status]
    username: Mapped[user] = mapped_column(unique=True)
    first_name: Mapped[user]
    last_name: Mapped[user]
    email: Mapped[str] = mapped_column(VARCHAR(254), unique=True)
    is_staff: Mapped[user_status]
    is_active: Mapped[user_status]
    date_joined: Mapped[datetime] = mapped_column(DateTime(timezone=True))


class BaseClass(Base):
    __abstract__ = True

    id: Mapped[intpk]
    description: Mapped[str | None] = mapped_column(VARCHAR(255), default="")
    author_id: Mapped[int] = mapped_column(
        ForeignKey("auth_user.id", ondelete="CASCADE")
        )
    created: Mapped[datetime] = mapped_column(DateTime(timezone=True))
